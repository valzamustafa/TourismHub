using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using TourismHub.API.Models;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services
{
    public class StripeWebhookService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly StripeSettings _stripeSettings;
        private readonly ILogger<StripeWebhookService> _logger;

        private const string PaymentIntentSucceeded = "payment_intent.succeeded";
        private const string PaymentIntentPaymentFailed = "payment_intent.payment_failed";
        private const string ChargeSucceeded = "charge.succeeded";
        private const string ChargeFailed = "charge.failed";
        private const string PaymentIntentCreated = "payment_intent.created";

        public StripeWebhookService(
            IPaymentRepository paymentRepository,
            IBookingRepository bookingRepository,
            IOptions<StripeSettings> stripeSettings,
            ILogger<StripeWebhookService> logger)
        {
            _paymentRepository = paymentRepository;
            _bookingRepository = bookingRepository;
            _stripeSettings = stripeSettings.Value;
            _logger = logger;
            
            if (!string.IsNullOrEmpty(_stripeSettings.SecretKey))
            {
                StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
            }
            else
            {
                _logger.LogWarning("Stripe SecretKey is not configured for webhooks");
            }
        }

        public async Task<bool> ProcessWebhookEventAsync(string json, string stripeSignature)
        {
            try
            {
                if (string.IsNullOrEmpty(_stripeSettings.WebhookSecret))
                {
                    _logger.LogError("Stripe WebhookSecret is not configured");
                    return false;
                }

                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    stripeSignature,
                    _stripeSettings.WebhookSecret
                );

                _logger.LogInformation($"Processing Stripe event: {stripeEvent.Type}");

                switch (stripeEvent.Type)
                {
                    case PaymentIntentSucceeded:
                        await HandlePaymentIntentSucceeded(stripeEvent);
                        break;
                        
                    case PaymentIntentPaymentFailed:
                        await HandlePaymentIntentFailed(stripeEvent);
                        break;
                        
                    case ChargeSucceeded:
                        await HandleChargeSucceeded(stripeEvent);
                        break;
                        
                    case ChargeFailed:
                        await HandleChargeFailed(stripeEvent);
                        break;
                        
                    case PaymentIntentCreated:
                        await HandlePaymentIntentCreated(stripeEvent);
                        break;
                        
                    default:
                        _logger.LogInformation($"Unhandled event type: {stripeEvent.Type}");
                        break;
                }

                return true;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe webhook error");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook");
                return false;
            }
        }

        private async Task HandlePaymentIntentSucceeded(Event stripeEvent)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent == null)
            {
                _logger.LogError("Failed to parse PaymentIntent from webhook");
                return;
            }

            if (paymentIntent.Metadata.TryGetValue("bookingId", out var bookingIdStr) &&
                Guid.TryParse(bookingIdStr, out var bookingId))
            {
                try
                {
                    var booking = await _bookingRepository.GetByIdAsync(bookingId);
                    if (booking != null)
                    {
                        var payment = new Payment
                        {
                            Id = Guid.NewGuid(),
                            BookingId = bookingId,
                            Amount = paymentIntent.Amount / 100m,
                            PaymentMethod = Domain.Enums.PaymentMethod.Stripe,
                            PaymentStatus = PaymentStatus.Paid,
                            TransactionId = paymentIntent.Id,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        await _paymentRepository.AddAsync(payment);
                        await _paymentRepository.SaveChangesAsync();

                        booking.Status = BookingStatus.Confirmed;
                        booking.PaymentStatus = PaymentStatus.Paid;
                        booking.UpdatedAt = DateTime.UtcNow;
                        _bookingRepository.Update(booking);
                        await _bookingRepository.SaveChangesAsync();

                        _logger.LogInformation($"Payment succeeded for booking {bookingId}, payment intent: {paymentIntent.Id}");
                    }
                    else
                    {
                        _logger.LogWarning($"Booking {bookingId} not found for payment intent {paymentIntent.Id}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error processing payment succeeded for booking {bookingId}");
                }
            }
            else
            {
                _logger.LogWarning($"No bookingId found in metadata for payment intent {paymentIntent.Id}");
            }
        }

        private async Task HandlePaymentIntentFailed(Event stripeEvent)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent == null) return;

            if (paymentIntent.Metadata.TryGetValue("bookingId", out var bookingIdStr) &&
                Guid.TryParse(bookingIdStr, out var bookingId))
            {
                var booking = await _bookingRepository.GetByIdAsync(bookingId);
                if (booking != null)
                {
                    booking.Status = BookingStatus.Canceled;
                    booking.PaymentStatus = PaymentStatus.Failed;
                    booking.UpdatedAt = DateTime.UtcNow;
                    _bookingRepository.Update(booking);
                    await _bookingRepository.SaveChangesAsync();

                    _logger.LogWarning($"Payment failed for booking {bookingId}, payment intent: {paymentIntent.Id}");
                }
            }
        }

        private async Task HandleChargeSucceeded(Event stripeEvent)
        {
            var charge = stripeEvent.Data.Object as Charge;
            if (charge?.PaymentIntentId != null)
            {
                _logger.LogInformation($"Charge succeeded for payment intent: {charge.PaymentIntentId}");
            }
        }

        private async Task HandleChargeFailed(Event stripeEvent)
        {
            var charge = stripeEvent.Data.Object as Charge;
            if (charge?.PaymentIntentId != null)
            {
                _logger.LogWarning($"Charge failed for payment intent: {charge.PaymentIntentId}");
            }
        }

        private async Task HandlePaymentIntentCreated(Event stripeEvent)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent != null)
            {
                _logger.LogInformation($"Payment intent created: {paymentIntent.Id}");
            }
        }

        public async Task<Event?> ConstructWebhookEvent(string json, string signature)
        {
            try
            {
                return EventUtility.ConstructEvent(
                    json,
                    signature,
                    _stripeSettings.WebhookSecret
                );
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Error constructing webhook event");
                return null;
            }
        }
    }
}