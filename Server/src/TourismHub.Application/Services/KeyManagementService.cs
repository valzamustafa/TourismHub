using System.Text.Json;
using Stripe;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using TourismHub.Application.Interfaces;
using TourismHub.API.Models;
using Microsoft.Extensions.Http;
using TourismHub.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;

namespace TourismHub.Application.Services
{
   
    public class StripeKeyInfo
    {
        public string SecretKey { get; set; } = string.Empty;
        public string PublishableKey { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsLive { get; set; }
        public string KeyId { get; set; } = string.Empty;
        public string Environment { get; set; } = "test";
        public string Description { get; set; } = string.Empty;
    }

    public interface IKeyManagementService
    {
        Task<StripeKeyInfo> GetOrCreateValidKeysAsync(bool forceRefresh = false);
        Task<StripeKeyInfo> RotateStripeKeysAsync();
        bool IsKeyExpiringSoon(StripeKeyInfo keyInfo);
        bool IsKeyValid(string key);
        Task<StripeKeyInfo> CreateNewStripeKeysAsync();
        Task<bool> TestKeyAsync(string secretKey);
    }

    public class KeyManagementService : IKeyManagementService
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<KeyManagementService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly StripeSettings _stripeSettings;
        private readonly TourismHub.Domain.Interfaces.IStripeKeyRepository? _stripeKeyRepository;
        private const string STRIPE_KEYS_CACHE_KEY = "stripe_keys";
        private const string STRIPE_BASE_URL = "https://api.stripe.com/v1";

        public KeyManagementService(
            IMemoryCache cache,
            ILogger<KeyManagementService> logger,
            IHttpClientFactory httpClientFactory,
            IOptions<StripeSettings> stripeSettings,
            TourismHub.Domain.Interfaces.IStripeKeyRepository? stripeKeyRepository = null)
        {
            _cache = cache;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _stripeSettings = stripeSettings.Value;
            _stripeKeyRepository = stripeKeyRepository;
        }


public async Task<StripeKeyInfo> GetOrCreateValidKeysAsync(bool forceRefresh = false)
{
    try
    {
        if (!forceRefresh && _cache.TryGetValue(STRIPE_KEYS_CACHE_KEY, out StripeKeyInfo cachedKeys))
        {
            if (cachedKeys != null && cachedKeys.ExpiresAt > DateTime.UtcNow.AddHours(24))
            {
                _logger.LogInformation($"Using cached Stripe keys (expires in {cachedKeys.ExpiresAt.Subtract(DateTime.UtcNow).Days} days)");
                return cachedKeys;
            }
        }

        _logger.LogInformation("Refreshing Stripe keys...");
        var newKeys = await RotateStripeKeysAsync();
        
        var cacheOptions = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromDays(6))
            .SetPriority(CacheItemPriority.High);
        
        _cache.Set(STRIPE_KEYS_CACHE_KEY, newKeys, cacheOptions);
        
        return newKeys;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting valid keys");
        throw;
    }
}
        public async Task<StripeKeyInfo> RotateStripeKeysAsync()
        {
            try
            {
                if (_stripeKeyRepository != null)
                {
                    var dbKey = await _stripeKeyRepository.GetActiveKeyAsync();
                    if (dbKey != null && dbKey.ExpiresAt > DateTime.UtcNow.AddDays(1))
                    {
                        _logger.LogInformation($"Using database-stored key: {dbKey.KeyId}");
                        return new StripeKeyInfo
                        {
                            SecretKey = dbKey.SecretKey,
                            PublishableKey = dbKey.PublishableKey,
                            CreatedAt = dbKey.CreatedAt,
                            ExpiresAt = dbKey.ExpiresAt,
                            IsLive = dbKey.Environment == "live",
                            KeyId = dbKey.KeyId,
                            Environment = dbKey.Environment,
                            Description = dbKey.Description
                        };
                    }
                }

                return await CreateNewStripeKeysAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to rotate Stripe keys");
                throw;
            }
        }

        public async Task<StripeKeyInfo> CreateNewStripeKeysAsync()
        {
            try
            {
                var keyInfo = new StripeKeyInfo
                {
                    SecretKey = _stripeSettings.SecretKey,
                    PublishableKey = _stripeSettings.PublishableKey,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(90),
                    IsLive = _stripeSettings.SecretKey?.Contains("_live_") ?? false,
                    KeyId = $"config_{DateTime.UtcNow:yyyyMMddHHmmss}",
                    Environment = _stripeSettings.SecretKey?.Contains("_live_") ?? false ? "live" : "test",
                    Description = "Configuration-based key"
                };

                if (_stripeKeyRepository != null)
                {
                    await _stripeKeyRepository.AddKeyAsync(new TourismHub.Domain.Entities.StripeApiKey
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
                        CreatedBy = "System"
                    });
                }

                _logger.LogInformation($"Created new Stripe key: {keyInfo.KeyId}");
                return keyInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create new Stripe keys");
                throw;
            }
        }

        public bool IsKeyExpiringSoon(StripeKeyInfo keyInfo)
        {
            return keyInfo.ExpiresAt < DateTime.UtcNow.AddDays(7);
        }

        public bool IsKeyValid(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                return false;

            var trimmedKey = key.Trim();
            
            if (!trimmedKey.StartsWith("sk_") && !trimmedKey.StartsWith("pk_"))
                return false;

            if (trimmedKey.Length < 50 || trimmedKey.Length > 150)
                return false;

            if (trimmedKey.Any(c => char.IsWhiteSpace(c)))
                return false;

            return true;
        }

        public async Task<bool> TestKeyAsync(string secretKey)
        {
            try
            {
                var oldKey = StripeConfiguration.ApiKey;
                StripeConfiguration.ApiKey = secretKey;
                
                var balanceService = new BalanceService();
                var balance = await balanceService.GetAsync();
                
                StripeConfiguration.ApiKey = oldKey;
                return true;
            }
            catch
            {
                return false;
            }
        }
    }

    
    public class StripeApiKeyResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Secret { get; set; } = string.Empty;
        public string PublishableKey { get; set; } = string.Empty;
        public long Created { get; set; }
        public bool Livemode { get; set; }
        public bool Revoked { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}