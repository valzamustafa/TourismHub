// Infrastructure/Repositories/NotificationRepository.cs
using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;
using System.Linq.Expressions;

namespace TourismHub.Infrastructure.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly TourismHubDbContext _context;

        public NotificationRepository(TourismHubDbContext context)
        {
            _context = context;
        }

 
        public async Task<Notification?> GetByIdAsync(Guid id)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(Guid userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetByUserIdAndTypeAsync(Guid userId, string type)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && n.Type.ToString() == type)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task AddAsync(Notification notification)
        {
            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<Notification> notifications)
        {
            await _context.Notifications.AddRangeAsync(notifications);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Notification notification)
        {
            _context.Notifications.Update(notification);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var notification = await GetByIdAsync(id);
            if (notification != null)
            {
                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteByUserIdAsync(Guid userId)
        {
            var notifications = await GetByUserIdAsync(userId);
            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
        }

        public async Task MarkAsReadAsync(Guid id)
        {
            var notification = await GetByIdAsync(id);
            if (notification != null)
            {
                notification.IsRead = true;
                await UpdateAsync(notification);
            }
        }

        public async Task MarkAllAsReadAsync(Guid userId)
        {
            var unreadNotifications = await GetUnreadByUserIdAsync(userId);
            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
            }
            
            if (unreadNotifications.Any())
            {
                _context.Notifications.UpdateRange(unreadNotifications);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Notification>> GetPaginatedAsync(Guid userId, int page, int pageSize)
        {
            if (page < 1) page = 1;
            if (pageSize > 100) pageSize = 100;
            if (pageSize < 1) pageSize = 20;

            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ThenByDescending(n => !n.IsRead)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync(Guid userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId);
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Notifications
                .AnyAsync(n => n.Id == id);
        }

        public async Task<IEnumerable<Notification>> GetRecentAsync(Guid userId, int count)
        {
            if (count < 1) count = 10;
            if (count > 100) count = 100;

            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notification>> GetFilteredAsync(
            Guid userId, 
            Expression<Func<Notification, bool>> filter, 
            int page = 1, 
            int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize > 100) pageSize = 100;
            if (pageSize < 1) pageSize = 20;

            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .Where(filter)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

      
        public async Task<IEnumerable<Notification>> GetOldUnreadNotificationsAsync(DateTime cutoffDate)
        {
            return await _context.Notifications
                .Where(n => !n.IsRead && n.CreatedAt < cutoffDate)
                .ToListAsync();
        }


        public async Task DeleteRangeAsync(IEnumerable<Guid> notificationIds)
        {
            var notifications = await _context.Notifications
                .Where(n => notificationIds.Contains(n.Id))
                .ToListAsync();
            
            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
        }
    }
}