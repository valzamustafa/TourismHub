using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using TourismHub.Application.Services;
using Stripe;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace TourismHub.Application.Services.BackgroundServices
{
    public class StripeKeyRotationService : BackgroundService
    {
        private readonly ILogger<StripeKeyRotationService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(6);
        private readonly TimeSpan _initialDelay = TimeSpan.FromSeconds(30);

        public StripeKeyRotationService(
            ILogger<StripeKeyRotationService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Stripe Key Rotation Service starting...");
            
            await Task.Delay(_initialDelay, stoppingToken);

            _logger.LogInformation("Stripe Key Rotation Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var keyService = scope.ServiceProvider.GetRequiredService<KeyManagementService>();
                        var currentKeys = await keyService.GetOrCreateValidKeysAsync();

                        if (keyService.IsKeyExpiringSoon(currentKeys))
                        {
                            _logger.LogWarning($"Stripe keys expiring soon ({currentKeys.ExpiresAt:yyyy-MM-dd}). Rotating...");
                            
                            try
                            {
                                var newKeys = await keyService.GetOrCreateValidKeysAsync(forceRefresh: true);
                                
                                if (keyService.IsKeyValid(newKeys.SecretKey))
                                {
                                    StripeConfiguration.ApiKey = newKeys.SecretKey;
                                    
                                    _logger.LogInformation($"Successfully rotated Stripe keys. New key ID: {newKeys.KeyId}");
                                    _logger.LogInformation($"Key valid until: {newKeys.ExpiresAt:yyyy-MM-dd}");
                                    
                                    await SendRotationNotification(newKeys);
                                }
                                else
                                {
                                    _logger.LogError("New key is invalid!");
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Failed to rotate keys");
                                await SendErrorNotification(ex);
                            }
                        }
                        else
                        {
                            _logger.LogDebug($"Stripe keys are valid until {currentKeys.ExpiresAt:yyyy-MM-dd} ({(currentKeys.ExpiresAt - DateTime.UtcNow).Days} days remaining)");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Stripe key rotation service");
                }

                try
                {
                    await Task.Delay(_checkInterval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }

            _logger.LogInformation("Stripe Key Rotation Service stopped");
        }

        private async Task SendRotationNotification(StripeKeyInfo newKeys)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var emailService = scope.ServiceProvider.GetService<TourismHub.Infrastructure.Services.IEmailService>();
                    if (emailService != null)
                    {
                       
                        await emailService.SendPasswordResetEmailAsync(
                            "admin@tourismhub.com",
                            "System Admin",
                            $"key-rotation-{newKeys.KeyId}",
                            "http://localhost:5224");
                            
                        _logger.LogInformation($"Sent rotation notification for key: {newKeys.KeyId}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send rotation notification email");
            }
        }

        private async Task SendErrorNotification(Exception ex)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var emailService = scope.ServiceProvider.GetService<TourismHub.Infrastructure.Services.IEmailService>();
                    if (emailService != null)
                    {
                        await emailService.SendPasswordResetEmailAsync(
                            "admin@tourismhub.com",
                            "System Admin",
                            $"key-rotation-error-{DateTime.UtcNow:yyyyMMddHHmmss}",
                            "http://localhost:5224");
                            
                        _logger.LogError($"Sent error notification for failed key rotation");
                    }
                }
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Failed to send error notification email");
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stripe Key Rotation Service is stopping...");
            await base.StopAsync(cancellationToken);
        }
    }
}