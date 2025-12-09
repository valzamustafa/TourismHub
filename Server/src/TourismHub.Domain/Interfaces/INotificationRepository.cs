// Domain/Interfaces/INotificationRepository.cs
using TourismHub.Domain.Entities;
using System.Linq.Expressions;

namespace TourismHub.Domain.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification?> GetByIdAsync(Guid id); // Shto '?' këtu
        Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(Guid userId);
        Task<IEnumerable<Notification>> GetByUserIdAndTypeAsync(Guid userId, string type);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task AddAsync(Notification notification);
        Task AddRangeAsync(IEnumerable<Notification> notifications);
        Task UpdateAsync(Notification notification);
        Task DeleteAsync(Guid id);
        Task DeleteByUserIdAsync(Guid userId);
        Task MarkAsReadAsync(Guid id);
        Task MarkAllAsReadAsync(Guid userId);
        Task<IEnumerable<Notification>> GetPaginatedAsync(Guid userId, int page, int pageSize);
        Task<int> GetTotalCountAsync(Guid userId);
        Task<bool> ExistsAsync(Guid id);
        Task<IEnumerable<Notification>> GetRecentAsync(Guid userId, int count);
        Task<IEnumerable<Notification>> GetFilteredAsync(
            Guid userId, 
            Expression<Func<Notification, bool>> filter, 
            int page = 1, 
            int pageSize = 20);
        
        // Metoda shtesë
        Task<IEnumerable<Notification>> GetOldUnreadNotificationsAsync(DateTime cutoffDate);
        Task DeleteRangeAsync(IEnumerable<Guid> notificationIds);
    }
}