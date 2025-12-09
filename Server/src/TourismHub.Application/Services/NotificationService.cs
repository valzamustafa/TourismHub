// Application/Services/NotificationService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Application.Services
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(Guid userId, string title, string message, 
            NotificationType type, Guid? relatedId = null);
        Task<List<Notification>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task MarkAsReadAsync(Guid notificationId);
        Task MarkAllAsReadAsync(Guid userId);
        Task DeleteNotificationAsync(Guid notificationId);
        Task DeleteAllNotificationsAsync(Guid userId);
        Task<int> GetTotalCountAsync(Guid userId);
    }

    public class NotificationService : INotificationService
    {
        private readonly TourismHubDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(TourismHubDbContext context, ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Notification> CreateNotificationAsync(Guid userId, string title, 
            string message, NotificationType type, Guid? relatedId = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
             
                if (string.IsNullOrWhiteSpace(title))
                    throw new ArgumentException("Title cannot be empty", nameof(title));
                
                if (string.IsNullOrWhiteSpace(message))
                    throw new ArgumentException("Message cannot be empty", nameof(message));
                
                if (userId == Guid.Empty)
                    throw new ArgumentException("Invalid user ID", nameof(userId));

                var notification = new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Title = title.Trim(),
                    Message = message.Trim(),
                    Type = type,
                    RelatedId = relatedId,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Notifications.AddAsync(notification);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Notification created for user {UserId}: {Title}", userId, title);
                return notification;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating notification for user {UserId}", userId);
                throw;
            }
        }

        public async Task<List<Notification>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 20)
        {
            try
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
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications for user {UserId}", userId);
                throw;
            }
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            try
            {
                return await _context.Notifications
                    .CountAsync(n => n.UserId == userId && !n.IsRead);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count for user {UserId}", userId);
                throw;
            }
        }

        public async Task<int> GetTotalCountAsync(Guid userId)
        {
            try
            {
                return await _context.Notifications
                    .CountAsync(n => n.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting total count for user {UserId}", userId);
                throw;
            }
        }

        public async Task MarkAsReadAsync(Guid notificationId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId);

                if (notification != null && !notification.IsRead)
                {
                    notification.IsRead = true;
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    
                    _logger.LogInformation("Notification {NotificationId} marked as read", notificationId);
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", notificationId);
                throw;
            }
        }

        public async Task MarkAllAsReadAsync(Guid userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var result = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead)
                    .ExecuteUpdateAsync(setters => 
                        setters.SetProperty(n => n.IsRead, true));

                await transaction.CommitAsync();
                
                _logger.LogInformation("Marked {Count} notifications as read for user {UserId}", result, userId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error marking all notifications as read for user {UserId}", userId);
                throw;
            }
        }

        public async Task DeleteNotificationAsync(Guid notificationId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var result = await _context.Notifications
                    .Where(n => n.Id == notificationId)
                    .ExecuteDeleteAsync();

                await transaction.CommitAsync();
                
                if (result > 0)
                {
                    _logger.LogInformation("Deleted notification {NotificationId}", notificationId);
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error deleting notification {NotificationId}", notificationId);
                throw;
            }
        }

        public async Task DeleteAllNotificationsAsync(Guid userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var result = await _context.Notifications
                    .Where(n => n.UserId == userId)
                    .ExecuteDeleteAsync();

                await transaction.CommitAsync();
                
                _logger.LogInformation("Deleted {Count} notifications for user {UserId}", result, userId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error deleting all notifications for user {UserId}", userId);
                throw;
            }
        }
    }
}