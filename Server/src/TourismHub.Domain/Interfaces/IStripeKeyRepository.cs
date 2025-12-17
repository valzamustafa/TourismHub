// Domain/Interfaces/IStripeKeyRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TourismHub.Domain.Entities;

namespace TourismHub.Domain.Interfaces
{
    public interface IStripeKeyRepository
    {
        Task<StripeApiKey?> GetByIdAsync(Guid id);
        Task<StripeApiKey?> GetByKeyIdAsync(string keyId);
        Task<StripeApiKey?> GetActiveKeyAsync(string environment = "test");
        Task<List<StripeApiKey>> GetAllKeysAsync();
        Task<List<StripeApiKey>> GetKeysByEnvironmentAsync(string environment);
        Task<List<StripeApiKey>> GetExpiringKeysAsync(int daysThreshold = 7);
        Task AddKeyAsync(StripeApiKey key);
        Task UpdateKeyAsync(StripeApiKey key);
        Task DeleteKeyAsync(Guid id);
        Task RevokeKeyAsync(Guid id, string revokedBy, string reason);
        Task IncrementUsageAsync(Guid id);
        Task<List<StripeApiKey>> GetHistoryAsync(int days = 30);
    }
}