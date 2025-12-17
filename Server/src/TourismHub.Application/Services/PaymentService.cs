using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;
using TourismHub.API.Models;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services
{
    public interface IPaymentService
    {
        Task<string> CreatePaymentIntentAsync(decimal amount, string currency, Dictionary<string, string>? metadata = null);
        Task<Payment> ProcessStripePaymentAsync(Guid bookingId, string paymentIntentId, decimal amount);
        Task<List<Payment>> GetAllPaymentsAsync();
        Task<Payment?> GetPaymentByIdAsync(Guid id);
        Task<Payment?> GetPaymentByBookingIdAsync(Guid bookingId);
        Task<List<Payment>> GetPaymentsByStatusAsync(PaymentStatus status);
        Task<Payment> CreatePaymentAsync(Payment payment);
        Task UpdatePaymentAsync(Payment payment);
        Task DeletePaymentAsync(Guid id);
        Task<bool> TestConnectionAsync();
        Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId);
    }

    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly ILogger<PaymentService> _logger;
        private readonly KeyManagementService _keyManagementService;
        private readonly StripeSettings _stripeSettings;
        private readonly int _maxRetryAttempts = 3;
        private readonly TimeSpan _retryDelay = TimeSpan.FromSeconds(2);

        public PaymentService(
            IPaymentRepository paymentRepository,
            IBookingRepository bookingRepository,
            ILogger<PaymentService> logger,
            KeyManagementService keyManagementService,
            IOptions<StripeSettings> stripeSettings)
        {
            _paymentRepository = paymentRepository;
            _bookingRepository = bookingRepository;
            _logger = logger;
            _keyManagementService = keyManagementService;
            _stripeSettings = stripeSettings.Value;
            
            InitializeStripeAsync().Wait();
        }

        private async Task InitializeStripeAsync()
        {
            try
            {
                var keys = await _keyManagementService.GetOrCreateValidKeysAsync();
                
                if (!_keyManagementService.IsKeyValid(keys.SecretKey))
                {
                    _logger.LogError("Invalid Stripe secret key configuration");
                    throw new InvalidOperationException("Invalid Stripe secret key");
                }

                StripeConfiguration.ApiKey = keys.SecretKey;
                _logger.LogInformation($"✅ Stripe initialized with key ID: {keys.KeyId}");
                _logger.LogInformation($"🔑 Key valid until: {keys.ExpiresAt:yyyy-MM-dd}");
                _logger.LogInformation($"🌍 Environment: {keys.Environment.ToUpper()}");
                _logger.LogInformation($"📝 Description: {keys.Description}");
                
                await TestStripeConnectionAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Stripe");
                throw;
            }
        }

        private async Task TestStripeConnectionAsync()
        {
            try
            {
                var balanceService = new BalanceService();
                var balance = await balanceService.GetAsync();
                
                _logger.LogInformation($"💰 Stripe connection test successful. Mode: {(balance.Livemode ? "LIVE" : "TEST")}");
                _logger.LogInformation($"💳 Available balance: {balance.Available?.FirstOrDefault()?.Amount ?? 0 / 100m:C}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stripe connection test failed");
                throw;
            }
        }

        public async Task<string> CreatePaymentIntentAsync(decimal amount, string currency, Dictionary<string, string>? metadata = null)
        {
            int attempt = 0;
            
            while (attempt < _maxRetryAttempts)
            {
                try
                {
                    await EnsureStripeInitializedAsync();

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
                        Description = "Payment for TourismHub booking",
                        AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                        {
                            Enabled = true,
                            AllowRedirects = "never"
                        }
                    };

                    _logger.LogInformation($"🔧 Calling Stripe API with amount: {options.Amount} {options.Currency}");
                    
                    var service = new PaymentIntentService();
                    var paymentIntent = await service.CreateAsync(options);

                    _logger.LogInformation($"✅ Created payment intent: {paymentIntent.Id}");
                    _logger.LogInformation($"🔐 Client secret generated");
                    _logger.LogInformation($"📊 Status: {paymentIntent.Status}");
                    
                    return paymentIntent.ClientSecret;
                }
                catch (StripeException ex) when (ex.Message.Contains("api_key_expired") || 
                                                 ex.Message.Contains("invalid_api_key") ||
                                                 ex.Message.Contains("authentication"))
                {
                    attempt++;
                    _logger.LogWarning($"Stripe API key issue (attempt {attempt}/{_maxRetryAttempts}): {ex.Message}");
                    
                    if (attempt < _maxRetryAttempts)
                    {
                        await RotateStripeKeyAsync();
                        await Task.Delay(_retryDelay);
                        continue;
                    }
                    else
                    {
                        _logger.LogError("Max retry attempts reached for key rotation");
                        throw new Exception($"Payment failed: {ex.Message}", ex);
                    }
                }
                catch (StripeException ex)
                {
                    _logger.LogError(ex, "❌ Stripe error creating payment intent");
                    _logger.LogError($"Stripe Error Type: {ex.StripeError?.Type}");
                    _logger.LogError($"Stripe Error Code: {ex.StripeError?.Code}");
                    _logger.LogError($"Stripe Error Message: {ex.StripeError?.Message}");
                    
                    throw new Exception($"Stripe error: {ex.Message}", ex);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ General error creating payment intent");
                    throw;
                }
            }
            
            throw new Exception("Failed to create payment intent after retries");
        }

        private async Task EnsureStripeInitializedAsync()
        {
            try
            {
                var keys = await _keyManagementService.GetOrCreateValidKeysAsync();
                
                if (StripeConfiguration.ApiKey != keys.SecretKey)
                {
                    StripeConfiguration.ApiKey = keys.SecretKey;
                    _logger.LogInformation($"🔄 Updated Stripe API key to: {keys.KeyId}");
                }
                
                if (_keyManagementService.IsKeyExpiringSoon(keys))
                {
                    _logger.LogWarning($"⚠️ Current key expires soon: {keys.ExpiresAt:yyyy-MM-dd}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to ensure Stripe initialization");
                throw;
            }
        }

        private async Task RotateStripeKeyAsync()
        {
            try
            {
                _logger.LogInformation("🔄 Attempting to rotate Stripe key...");
                
                var newKeys = await _keyManagementService.GetOrCreateValidKeysAsync(forceRefresh: true);
                
                if (!_keyManagementService.IsKeyValid(newKeys.SecretKey))
                {
                    throw new InvalidOperationException("New key is invalid");
                }

                StripeConfiguration.ApiKey = newKeys.SecretKey;
                _logger.LogInformation($"✅ Successfully rotated to new Stripe key: {newKeys.KeyId}");
                _logger.LogInformation($"📅 New key expires: {newKeys.ExpiresAt:yyyy-MM-dd}");
                
                await Task.Delay(1000);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to rotate Stripe key");
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
                await EnsureStripeInitializedAsync();
                
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

        public async Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId)
        {
            try
            {
                await EnsureStripeInitializedAsync();
                
                var service = new PaymentIntentService();
                return await service.GetAsync(paymentIntentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting payment intent {paymentIntentId}");
                throw;
            }
        }

        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                await EnsureStripeInitializedAsync();
                
                var balanceService = new BalanceService();
                var balance = await balanceService.GetAsync();
                
                _logger.LogInformation($"Stripe connection successful. Mode: {(balance.Livemode ? "LIVE" : "TEST")}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Stripe connection test failed");
                return false;
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