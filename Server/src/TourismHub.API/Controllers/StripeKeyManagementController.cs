using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;
using Microsoft.Extensions.Options;

namespace TourismHub.API.Controllers
{
    [Route("api/admin/stripe-keys")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class StripeKeyManagementController : ControllerBase
    {
        private readonly IKeyManagementService _keyService;
        private readonly IStripeKeyRepository _stripeKeyRepository;
        private readonly ILogger<StripeKeyManagementController> _logger;
        private readonly TourismHub.Application.Services.IPaymentService? _paymentService;

        public StripeKeyManagementController(
            IKeyManagementService keyService,
            IStripeKeyRepository stripeKeyRepository,
            ILogger<StripeKeyManagementController> logger,
            TourismHub.Application.Services.IPaymentService? paymentService = null)
        {
            _keyService = keyService;
            _stripeKeyRepository = stripeKeyRepository;
            _logger = logger;
            _paymentService = paymentService;
        }

        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentKeys()
        {
            try
            {
                var keys = await _keyService.GetOrCreateValidKeysAsync();
                var activeKey = await _stripeKeyRepository.GetActiveKeyAsync(keys.Environment);
                
                return Ok(new
                {
                    success = true,
                    keys = new
                    {
                        keyId = keys.KeyId,
                        secretKeyPrefix = keys.SecretKey.Substring(0, Math.Min(8, keys.SecretKey.Length)) + "...",
                        publishableKey = keys.PublishableKey,
                        expiresAt = keys.ExpiresAt,
                        daysRemaining = (keys.ExpiresAt - DateTime.UtcNow).Days,
                        environment = keys.Environment,
                        description = keys.Description,
                        isValid = _keyService.IsKeyValid(keys.SecretKey),
                        isExpiringSoon = _keyService.IsKeyExpiringSoon(keys)
                    },
                    activeKeyInfo = activeKey != null ? new
                    {
                        activeKey.KeyId,
                        activeKey.CreatedAt,
                        activeKey.ExpiresAt,
                        activeKey.UsageCount,
                        activeKey.LastUsed,
                        activeKey.IsValid
                    } : null,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current Stripe keys");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllKeys()
        {
            try
            {
                var keys = await _stripeKeyRepository.GetAllKeysAsync();
                
                return Ok(new
                {
                    success = true,
                    count = keys.Count,
                    keys = keys.Select(k => new
                    {
                        k.Id,
                        k.KeyId,
                        environment = k.Environment,
                        createdAt = k.CreatedAt,
                        expiresAt = k.ExpiresAt,
                        daysRemaining = k.DaysRemaining,
                        k.IsActive,
                        k.IsRevoked,
                        k.IsValid,
                        k.UsageCount,
                        k.LastUsed,
                        k.Description,
                        k.CreatedBy,
                        k.RevokedAt,
                        k.RevokedBy,
                        k.RevokedReason
                    }),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all Stripe keys");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpGet("expiring")]
        public async Task<IActionResult> GetExpiringKeys([FromQuery] int days = 7)
        {
            try
            {
                var expiringKeys = await _stripeKeyRepository.GetExpiringKeysAsync(days);
                
                return Ok(new
                {
                    success = true,
                    count = expiringKeys.Count,
                    thresholdDays = days,
                    keys = expiringKeys.Select(k => new
                    {
                        k.KeyId,
                        k.Environment,
                        k.ExpiresAt,
                        daysRemaining = k.DaysRemaining,
                        k.IsActive,
                        k.Description
                    }),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting expiring Stripe keys");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("rotate")]
        public async Task<IActionResult> RotateKeys([FromBody] RotateKeysRequest request)
        {
            try
            {
                var currentUser = User.Identity?.Name ?? "Unknown";
                _logger.LogInformation($"Manual key rotation requested by {currentUser}");
                
                var oldKeys = await _keyService.GetOrCreateValidKeysAsync();
                var newKeys = await _keyService.GetOrCreateValidKeysAsync(forceRefresh: true);
                
                if (oldKeys.KeyId == newKeys.KeyId)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "New keys are the same as old keys"
                    });
                }
                
                return Ok(new
                {
                    success = true,
                    message = "Keys rotated successfully",
                    oldKeys = new
                    {
                        keyId = oldKeys.KeyId,
                        environment = oldKeys.Environment,
                        expiresAt = oldKeys.ExpiresAt
                    },
                    newKeys = new
                    {
                        keyId = newKeys.KeyId,
                        environment = newKeys.Environment,
                        expiresAt = newKeys.ExpiresAt,
                        description = newKeys.Description
                    },
                    rotatedBy = currentUser,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rotating Stripe keys");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateKey([FromBody] ValidateKeyRequest request)
        {
            try
            {
                var isValid = _keyService.IsKeyValid(request.Key);
                var isWorking = false;
                
                if (isValid && _keyService is KeyManagementService keyService)
                {
                    isWorking = await keyService.TestKeyAsync(request.Key);
                }
                
                return Ok(new
                {
                    success = true,
                    validation = new
                    {
                        formatValid = isValid,
                        working = isWorking,
                        keyType = request.Key.StartsWith("sk_") ? "Secret" : 
                                 request.Key.StartsWith("pk_") ? "Publishable" : "Unknown",
                        length = request.Key.Length
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                if (_paymentService == null)
                {
                    return BadRequest(new { success = false, error = "Payment service not available" });
                }
                
                var isConnected = await _paymentService.TestConnectionAsync();
                var keys = await _keyService.GetOrCreateValidKeysAsync();
                
                return Ok(new
                {
                    success = true,
                    connected = isConnected,
                    currentKey = new
                    {
                        keyId = keys.KeyId,
                        environment = keys.Environment,
                        expiresAt = keys.ExpiresAt,
                        daysRemaining = (keys.ExpiresAt - DateTime.UtcNow).Days
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing Stripe connection");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("add-manual")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> AddManualKey([FromBody] AddManualKeyRequest request)
        {
            try
            {
                if (!_keyService.IsKeyValid(request.SecretKey))
                {
                    return BadRequest(new { success = false, error = "Invalid secret key format" });
                }
                
                if (!_keyService.IsKeyValid(request.PublishableKey))
                {
                    return BadRequest(new { success = false, error = "Invalid publishable key format" });
                }
                
                var keyInfo = new StripeKeyInfo
                {
                    SecretKey = request.SecretKey,
                    PublishableKey = request.PublishableKey,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(request.ValidForDays),
                    IsLive = request.SecretKey.Contains("_live_"),
                    KeyId = $"manual_{DateTime.UtcNow:yyyyMMddHHmmss}",
                    Environment = request.SecretKey.Contains("_live_") ? "live" : "test",
                    Description = request.Description ?? "Manually added key"
                };
                
                var stripeKey = new StripeApiKey
                {
                    Id = Guid.NewGuid(),
                    SecretKey = keyInfo.SecretKey,
                    PublishableKey = keyInfo.PublishableKey,
                    KeyId = keyInfo.KeyId,
                    Environment = keyInfo.Environment,
                    CreatedAt = keyInfo.CreatedAt,
                    ExpiresAt = keyInfo.ExpiresAt,
                    IsActive = true,
                    Description = keyInfo.Description,
                    CreatedBy = User.Identity?.Name ?? "Manual",
                    UsageCount = 0
                };
                
                await _stripeKeyRepository.AddKeyAsync(stripeKey);
                
                return Ok(new
                {
                    success = true,
                    message = "Manual key added successfully",
                    key = new
                    {
                        keyId = keyInfo.KeyId,
                        environment = keyInfo.Environment,
                        expiresAt = keyInfo.ExpiresAt,
                        description = keyInfo.Description
                    },
                    addedBy = User.Identity?.Name,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding manual Stripe key");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpGet("health")]
        [AllowAnonymous]
        public async Task<IActionResult> GetHealthStatus()
        {
            try
            {
                var keys = await _keyService.GetOrCreateValidKeysAsync();
                var isKeyValid = _keyService.IsKeyValid(keys.SecretKey);
                var isExpiringSoon = _keyService.IsKeyExpiringSoon(keys);
                
                var healthStatus = new
                {
                    service = "stripe_key_management",
                    status = isKeyValid ? "healthy" : "unhealthy",
                    timestamp = DateTime.UtcNow,
                    keyInfo = new
                    {
                        keyId = keys.KeyId,
                        environment = keys.Environment,
                        isValid = isKeyValid,
                        expiresAt = keys.ExpiresAt,
                        daysRemaining = (keys.ExpiresAt - DateTime.UtcNow).Days,
                        isExpiringSoon = isExpiringSoon,
                        description = keys.Description
                    },
                    warnings = isExpiringSoon ? new[] { "Key is expiring soon" } : Array.Empty<string>()
                };
                
                return Ok(healthStatus);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    service = "stripe_key_management",
                    status = "unhealthy",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }
    }

    public class RotateKeysRequest
    {
        public string? Reason { get; set; }
        public bool Force { get; set; }
    }

    public class ValidateKeyRequest
    {
        public string Key { get; set; } = string.Empty;
    }

    public class AddManualKeyRequest
    {
        public string SecretKey { get; set; } = string.Empty;
        public string PublishableKey { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int ValidForDays { get; set; } = 90;
    }
}