using TourismHub.Domain.Entities;

namespace TourismHub.Domain.Interfaces
{
    public interface IPasswordResetTokenRepository
    {
        Task<PasswordResetToken?> GetByTokenAsync(string token);
        Task<PasswordResetToken?> GetByUserIdAsync(Guid userId);
        Task AddAsync(PasswordResetToken token);
        Task UpdateAsync(PasswordResetToken token);
        Task DeleteAsync(Guid id);
    }
}