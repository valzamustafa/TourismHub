 using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TourismHub.API.Hubs;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace TourismHub.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly PaymentService _paymentService;
        private readonly ILogger<PaymentsController> _logger;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly BookingService _bookingService;
        private readonly ActivityService _activityService;
        private readonly UserService _userService;

        public PaymentsController(
            PaymentService paymentService, 
            ILogger<PaymentsController> logger,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubContext,
            BookingService bookingService,
            ActivityService activityService,
            UserService userService)
        {
            _paymentService = paymentService;
            _logger = logger;
            _notificationService = notificationService;
            _hubContext = hubContext;
            _bookingService = bookingService;
            _activityService = activityService;
            _userService = userService;
        }

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
        {
            try
            {
                _logger.LogInformation($"Creating payment intent for booking: {request.BookingId}, Amount: {request.Amount} {request.Currency}");

                var metadata = new Dictionary<string, string>
                {
                    { "bookingId", request.BookingId.ToString() },
                    { "userId", request.UserId?.ToString() ?? User.FindFirst("userId")?.Value ?? "unknown" },
                    { "description", request.Description },
                    { "createdAt", DateTime.UtcNow.ToString("O") }
                };
                var clientSecret = await _paymentService.CreatePaymentIntentAsync(
                    request.Amount,
                    request.Currency,
                    metadata);

                return Ok(new
                {
                    success = true,
                    clientSecret = clientSecret,
                    message = "Payment intent created successfully",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating payment intent for booking {request.BookingId}");
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
        {
            try
            {
                _logger.LogInformation($"Confirming payment for booking: {request.BookingId}, PaymentIntent: {request.PaymentIntentId}");

                var payment = await _paymentService.ProcessStripePaymentAsync(
                    request.BookingId,
                    request.PaymentIntentId,
                    request.Amount);

               
                var booking = await _bookingService.GetBookingByIdAsync(request.BookingId);
                if (booking != null)
                {
                    await _notificationService.SendRealTimeNotification(
                        _hubContext,
                        booking.UserId,
                        "Payment Successful",
                        $"Your payment of {request.Amount:C} has been processed successfully.",
                        NotificationType.Payment,
                        payment.Id
                    );

                    var activity = await _activityService.GetActivityByIdAsync(booking.ActivityId);
                    if (activity?.ProviderId != null)
                    {
                        await _notificationService.SendRealTimeNotification(
                            _hubContext,
                            activity.ProviderId.Value,
                            "Payment Received",
                            $"You have received a payment of {request.Amount:C} for booking #{request.BookingId}.",
                            NotificationType.Payment,
                            payment.Id
                        );
                    }

                    var admins = await _userService.GetUsersByRoleAsync(UserRole.Admin);
                    foreach (var admin in admins)
                    {
                        await _notificationService.SendRealTimeNotification(
                            _hubContext,
                            admin.Id,
                            "Payment Processed",
                            $"Payment of {request.Amount:C} processed for booking #{request.BookingId}.",
                            NotificationType.Payment,
                            payment.Id
                        );
                    }
                }

                return Ok(new
                {
                    success = true,
                    message = "Payment confirmed successfully",
                    payment = new
                    {
                        id = payment.Id,
                        bookingId = payment.BookingId,
                        amount = payment.Amount,
                        status = payment.PaymentStatus.ToString(),
                        transactionId = payment.TransactionId,
                        createdAt = payment.CreatedAt
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error confirming payment for booking {request.BookingId}");
    
                var booking = await _bookingService.GetBookingByIdAsync(request.BookingId);
                if (booking != null)
                {
                    await _notificationService.SendRealTimeNotification(
                        _hubContext,
                        booking.UserId,
                        "Payment Failed",
                        $"Your payment failed: {ex.Message}",
                        NotificationType.Payment,
                        booking.Id
                    );
                }
                
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPayments()
        {
            try
            {
                var payments = await _paymentService.GetAllPaymentsAsync();
                
                return Ok(new
                {
                    success = true,
                    count = payments.Count,
                    payments = payments.Select(p => new
                    {
                        id = p.Id,
                        bookingId = p.BookingId,
                        amount = p.Amount,
                        paymentMethod = p.PaymentMethod.ToString(),
                        status = p.PaymentStatus.ToString(),
                        transactionId = p.TransactionId,
                        createdAt = p.CreatedAt,
                        updatedAt = p.UpdatedAt
                    }),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all payments");
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPaymentById(Guid id)
        {
            try
            {
                var payment = await _paymentService.GetPaymentByIdAsync(id);
                
                if (payment == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        error = $"Payment with ID {id} not found"
                    });
                }

                return Ok(new
                {
                    success = true,
                    payment = new
                    {
                        id = payment.Id,
                        bookingId = payment.BookingId,
                        amount = payment.Amount,
                        paymentMethod = payment.PaymentMethod.ToString(),
                        status = payment.PaymentStatus.ToString(),
                        transactionId = payment.TransactionId,
                        createdAt = payment.CreatedAt,
                        updatedAt = payment.UpdatedAt
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting payment {id}");
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        [HttpGet("booking/{bookingId:guid}")]
        public async Task<IActionResult> GetPaymentByBookingId(Guid bookingId)
        {
            try
            {
                var payment = await _paymentService.GetPaymentByBookingIdAsync(bookingId);
                
                if (payment == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        error = $"Payment for booking {bookingId} not found"
                    });
                }

                return Ok(new
                {
                    success = true,
                    payment = new
                    {
                        id = payment.Id,
                        bookingId = payment.BookingId,
                        amount = payment.Amount,
                        paymentMethod = payment.PaymentMethod.ToString(),
                        status = payment.PaymentStatus.ToString(),
                        transactionId = payment.TransactionId,
                        createdAt = payment.CreatedAt,
                        updatedAt = payment.UpdatedAt
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting payment for booking {bookingId}");
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        [HttpGet("test-connection")]
        [AllowAnonymous]
        public IActionResult TestStripeConnection()
        {
            try
            {
                var hasApiKey = !string.IsNullOrEmpty(Stripe.StripeConfiguration.ApiKey);
                
                return Ok(new
                {
                    success = true,
                    stripeConfigured = hasApiKey,
                    keyLength = Stripe.StripeConfiguration.ApiKey?.Length ?? 0,
                    keyPrefix = hasApiKey ? Stripe.StripeConfiguration.ApiKey?.Substring(0, Math.Min(20, Stripe.StripeConfiguration.ApiKey?.Length ?? 0)) + "..." : "No key",
                    environment = hasApiKey && Stripe.StripeConfiguration.ApiKey?.StartsWith("sk_test_") == true ? "TEST" : 
                                 hasApiKey && Stripe.StripeConfiguration.ApiKey?.StartsWith("sk_live_") == true ? "LIVE" : "UNKNOWN",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing Stripe connection");
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        [HttpPost("test")]
        [AllowAnonymous]
        public async Task<IActionResult> TestPaymentIntent([FromBody] TestPaymentRequest request)
        {
            try
            {
                _logger.LogInformation($"Creating test payment intent: {request.Amount} {request.Currency}");
                
                var metadata = new Dictionary<string, string>
                {
                    { "test", "true" },
                    { "timestamp", DateTime.UtcNow.ToString("O") },
                    { "purpose", "Test payment" }
                };

                var clientSecret = await _paymentService.CreatePaymentIntentAsync(
                    request.Amount,
                    request.Currency,
                    metadata);

                return Ok(new
                {
                    success = true,
                    message = "Test payment intent created successfully",
                    clientSecret = clientSecret,
                    amount = request.Amount,
                    currency = request.Currency,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating test payment intent");
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }
    }

    public class CreatePaymentIntentRequest
    {
        public Guid BookingId { get; set; }
        public Guid? UserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "usd";
        public string Description { get; set; } = "TourismHub Booking Payment";
    }

    public class ConfirmPaymentRequest
    {
        public Guid BookingId { get; set; }
        public string PaymentIntentId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class TestPaymentRequest
    {
        public decimal Amount { get; set; } = 10.00m;
        public string Currency { get; set; } = "usd";
    }
} 