using TourismHub.Domain.Entities;

namespace TourismHub.Domain.Interfaces
{
    public interface IAdminLogRepository
    {
        Task<AdminLog?> GetByIdAsync(Guid id);
        Task<List<AdminLog>> GetAllAsync();
        Task<List<AdminLog>> GetByAdminIdAsync(Guid adminId);
        Task AddAsync(AdminLog adminLog);
        Task SaveChangesAsync();
    }
}