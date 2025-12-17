using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging; 

namespace TourismHub.Infrastructure.Repositories
{
    public class StripeKeyRepository : IStripeKeyRepository
    {
        private readonly TourismHubDbContext _context;
        private readonly ILogger<StripeKeyRepository> _logger;

        public StripeKeyRepository(
            TourismHubDbContext context, 
            ILogger<StripeKeyRepository> logger) 
        {
            _context = context;
            _logger = logger;
        }

        public async Task<StripeApiKey?> GetByIdAsync(Guid id)
        {
            return await _context.StripeApiKeys
                .FirstOrDefaultAsync(k => k.Id == id);
        }


        public async Task<StripeApiKey?> GetByKeyIdAsync(string keyId)
        {
            return await _context.StripeApiKeys
                .FirstOrDefaultAsync(k => k.KeyId == keyId);
        }

        public async Task<StripeApiKey?> GetActiveKeyAsync(string environment = "test")
        {
            return await _context.StripeApiKeys
                .Where(k => k.Environment == environment && 
                           k.IsActive && 
                           !k.IsRevoked && 
                           k.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(k => k.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<List<StripeApiKey>> GetAllKeysAsync()
        {
            return await _context.StripeApiKeys
                .OrderByDescending(k => k.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<StripeApiKey>> GetKeysByEnvironmentAsync(string environment)
        {
            return await _context.StripeApiKeys
                .Where(k => k.Environment == environment)
                .OrderByDescending(k => k.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<StripeApiKey>> GetExpiringKeysAsync(int daysThreshold = 7)
        {
            var thresholdDate = DateTime.UtcNow.AddDays(daysThreshold);
            
            return await _context.StripeApiKeys
                .Where(k => k.IsActive && 
                           !k.IsRevoked && 
                           k.ExpiresAt <= thresholdDate && 
                           k.ExpiresAt > DateTime.UtcNow)
                .OrderBy(k => k.ExpiresAt)
                .ToListAsync();
        }

        public async Task AddKeyAsync(StripeApiKey key)
        {
            try
            {
                await _context.StripeApiKeys.AddAsync(key);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Added new Stripe key: {key.KeyId} for environment: {key.Environment}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to add Stripe key: {key.KeyId}");
                throw;
            }
        }

        public async Task UpdateKeyAsync(StripeApiKey key)
        {
            try
            {
                _context.StripeApiKeys.Update(key);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Updated Stripe key: {key.KeyId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to update Stripe key: {key.KeyId}");
                throw;
            }
        }

        public async Task DeleteKeyAsync(Guid id)
        {
            try
            {
                var key = await GetByIdAsync(id);
                if (key != null)
                {
                    _context.StripeApiKeys.Remove(key);
                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation($"Deleted Stripe key: {key.KeyId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to delete Stripe key with ID: {id}");
                throw;
            }
        }

        public async Task RevokeKeyAsync(Guid id, string revokedBy, string reason)
        {
            try
            {
                var key = await GetByIdAsync(id);
                if (key != null)
                {
                    key.IsRevoked = true;
                    key.RevokedAt = DateTime.UtcNow;
                    key.RevokedBy = revokedBy;
                    key.RevokedReason = reason;
                    key.IsActive = false;
                    
                    await UpdateKeyAsync(key);
                    
                    _logger.LogWarning($"Revoked Stripe key: {key.KeyId}. Reason: {reason}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to revoke Stripe key with ID: {id}");
                throw;
            }
        }

        public async Task IncrementUsageAsync(Guid id)
        {
            try
            {
                var key = await GetByIdAsync(id);
                if (key != null)
                {
                    key.UsageCount++;
                    key.LastUsed = DateTime.UtcNow;
                    
                    await UpdateKeyAsync(key);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to increment usage for Stripe key: {id}");
                throw;
            }
        }

        public async Task<List<StripeApiKey>> GetHistoryAsync(int days = 30)
        {
            var dateThreshold = DateTime.UtcNow.AddDays(-days);
            
            return await _context.StripeApiKeys
                .Where(k => k.CreatedAt >= dateThreshold)
                .OrderByDescending(k => k.CreatedAt)
                .ToListAsync();
        }
    }
}