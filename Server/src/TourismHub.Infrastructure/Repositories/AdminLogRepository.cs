using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Infrastructure.Repositories
{
    public class AdminLogRepository : IAdminLogRepository
    {
        private readonly TourismHubDbContext _context;

        public AdminLogRepository(TourismHubDbContext context)
        {
            _context = context;
        }

        public async Task<AdminLog?> GetByIdAsync(Guid id)
        {
            return await _context.AdminLogs
                .Include(al => al.Admin)
                .FirstOrDefaultAsync(al => al.Id == id);
        }

        public async Task<List<AdminLog>> GetAllAsync()
        {
            return await _context.AdminLogs
                .Include(al => al.Admin)
                .ToListAsync();
        }

        public async Task<List<AdminLog>> GetByAdminIdAsync(Guid adminId)
        {
            return await _context.AdminLogs
                .Where(al => al.AdminId == adminId)
                .Include(al => al.Admin)
                .ToListAsync();
        }

        public async Task AddAsync(AdminLog adminLog)
        {
            await _context.AdminLogs.AddAsync(adminLog);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}