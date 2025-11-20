using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services
{
    public class AdminLogService
    {
        private readonly IAdminLogRepository _adminLogRepository;

        public AdminLogService(IAdminLogRepository adminLogRepository)
        {
            _adminLogRepository = adminLogRepository;
        }

        public async Task<AdminLog?> GetLogByIdAsync(Guid id)
        {
            return await _adminLogRepository.GetByIdAsync(id);
        }

        public async Task<List<AdminLog>> GetAllLogsAsync()
        {
            return await _adminLogRepository.GetAllAsync();
        }

        public async Task<List<AdminLog>> GetAdminLogsAsync(Guid adminId)
        {
            return await _adminLogRepository.GetByAdminIdAsync(adminId);
        }

        public async Task<AdminLog> CreateLogAsync(AdminLog adminLog)
        {
            await _adminLogRepository.AddAsync(adminLog);
            await _adminLogRepository.SaveChangesAsync();
            return adminLog;
        }
    }
}