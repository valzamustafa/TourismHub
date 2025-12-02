using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using TourismHub.API.Models;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services
{
    public class PaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly StripeSettings _stripeSettings;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            IPaymentRepository paymentRepository,
            IBookingRepository bookingRepository,
            IOptions<StripeSettings> stripeSettings,
            ILogger<PaymentService> logger)
        {
            _paymentRepository = paymentRepository;
            _bookingRepository = bookingRepository;
            _stripeSettings = stripeSettings.Value;
            _logger = logger;
            
            _logger.LogInformation("✅ PaymentService initialized");
            _logger.LogInformation($"🔑 Stripe Key Configured: {!string.IsNullOrEmpty(StripeConfiguration.ApiKey)}");
            
            if (string.IsNullOrEmpty(StripeConfiguration.ApiKey))
            {
                _logger.LogWarning("⚠️ Stripe API Key is not configured in the application");
            }
        }

        public async Task<string> CreatePaymentIntentAsync(decimal amount, string currency, Dictionary<string, string>? metadata = null)
        {
            try
            {
                _logger.LogInformation($"💳 Creating payment intent: Amount={amount}, Currency={currency}");
                
                if (string.IsNullOrEmpty(StripeConfiguration.ApiKey))
                {
                    var error = "Stripe is not configured. Please check appsettings.json";
                    _logger.LogError(error);
                    throw new InvalidOperationException(error);
                }

                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(amount * 100), 
                    Currency = currency.ToLower(),
                    PaymentMethodTypes = new List<string> { "card" },
                    Metadata = metadata ?? new Dictionary<string, string>(),
                    Description = "Payment for TourismHub booking"
                };

                _logger.LogInformation($"🔧 Calling Stripe API with amount: {options.Amount} {options.Currency}");
                
                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);

                _logger.LogInformation($"✅ Created payment intent: {paymentIntent.Id}");
                _logger.LogInformation($"🔐 Client secret generated");
                
                return paymentIntent.ClientSecret;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "❌ Stripe error creating payment intent");
                _logger.LogError($"Stripe Error Type: {ex.StripeError?.Type}");
                _logger.LogError($"Stripe Error Code: {ex.StripeError?.Code}");
                _logger.LogError($"Stripe Error Message: {ex.StripeError?.Message}");
                _logger.LogError($"Current API Key (first 20 chars): {StripeConfiguration.ApiKey?.Substring(0, Math.Min(20, StripeConfiguration.ApiKey?.Length ?? 0))}...");
                
                throw new Exception($"Stripe error: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ General error creating payment intent");
                throw;
            }
        }

        public async Task<Payment> ProcessStripePaymentAsync(
            Guid bookingId, 
            string paymentIntentId, 
            decimal amount)
        {
            try
            {
                _logger.LogInformation($"🔍 Verifying payment: Booking={bookingId}, Intent={paymentIntentId}");

                var service = new PaymentIntentService();
                var paymentIntent = await service.GetAsync(paymentIntentId);

                if (paymentIntent.Status != "succeeded")
                {
                    _logger.LogWarning($"Payment failed with status: {paymentIntent.Status}");
                    throw new Exception($"Payment failed with status: {paymentIntent.Status}");
                }

                var booking = await _bookingRepository.GetByIdAsync(bookingId);
                if (booking == null)
                {
                    throw new Exception($"Booking with ID {bookingId} not found");
                }

                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    BookingId = bookingId,
                    Amount = amount,
                    PaymentMethod = Domain.Enums.PaymentMethod.Stripe,
                    PaymentStatus = PaymentStatus.Paid,
                    TransactionId = paymentIntentId,
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

                _logger.LogInformation($"✅ Processed Stripe payment for booking {bookingId}, amount: {amount}");

                return payment;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "❌ Stripe verification failed");
                throw new Exception($"Stripe verification failed: {ex.Message}", ex);
            }
        }

        public async Task<List<Payment>> GetAllPaymentsAsync()
        {
            return await _paymentRepository.GetAllAsync();
        }

        public async Task<Payment?> GetPaymentByIdAsync(Guid id)
        {
            return await _paymentRepository.GetByIdAsync(id);
        }

        public async Task<Payment?> GetPaymentByBookingIdAsync(Guid bookingId)
        {
            return await _paymentRepository.GetByBookingIdAsync(bookingId);
        }

        public async Task<List<Payment>> GetPaymentsByStatusAsync(PaymentStatus status)
        {
            return await _paymentRepository.GetByStatusAsync(status);
        }

        public async Task<Payment> CreatePaymentAsync(Payment payment)
        {
            await _paymentRepository.AddAsync(payment);
            await _paymentRepository.SaveChangesAsync();
            return payment;
        }

        public async Task UpdatePaymentAsync(Payment payment)
        {
            _paymentRepository.Update(payment);
            await _paymentRepository.SaveChangesAsync();
        }

        public async Task DeletePaymentAsync(Guid id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);
            if (payment != null)
            {
                var repositoryType = _paymentRepository.GetType();
                var removeMethod = repositoryType.GetMethod("Remove");
                
                if (removeMethod != null)
                {
                    removeMethod.Invoke(_paymentRepository, new object[] { payment });
                }
                else
                {
                    
                    _paymentRepository.Update(payment);
                }
                
                await _paymentRepository.SaveChangesAsync();
            }
        }
    }
}