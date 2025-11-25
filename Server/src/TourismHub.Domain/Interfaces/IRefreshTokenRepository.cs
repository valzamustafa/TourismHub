using TourismHub.Domain.Entities;

namespace TourismHub.Domain.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task CreateAsync(RefreshToken refreshToken);
    Task UpdateAsync(RefreshToken refreshToken);
    Task RevokeAllForUserAsync(Guid userId);
    Task CleanExpiredTokensAsync();
}