using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Infrastructure.Repositories
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly TourismHubDbContext _context;

        public PasswordResetTokenRepository(TourismHubDbContext context)
        {
            _context = context;
        }

        public async Task<PasswordResetToken?> GetByTokenAsync(string token)
        {
            return await _context.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token);
        }

        public async Task<PasswordResetToken?> GetByUserIdAsync(Guid userId)
        {
            return await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.UserId == userId && !t.IsUsed);
        }

        public async Task AddAsync(PasswordResetToken token)
        {
            await _context.PasswordResetTokens.AddAsync(token);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(PasswordResetToken token)
        {
            _context.PasswordResetTokens.Update(token);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var token = await _context.PasswordResetTokens.FindAsync(id);
            if (token != null)
            {
                _context.PasswordResetTokens.Remove(token);
                await _context.SaveChangesAsync();
            }
        }
    }
}