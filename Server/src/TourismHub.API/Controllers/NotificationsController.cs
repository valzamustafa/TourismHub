using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            INotificationService notificationService, 
            ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");
            return Guid.Parse(userIdClaim);
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetUserId();
                var notifications = await _notificationService.GetUserNotificationsAsync(userId, page, pageSize);

                var result = notifications.Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Message,
                    Type = n.Type.ToString(),
                    TypeValue = (int)n.Type,
                    n.RelatedId,
                    n.IsRead,
                    n.CreatedAt,
                    TimeAgo = GetTimeAgo(n.CreatedAt)
                });

                return Ok(new
                {
                    success = true,
                    notifications = result,
                    pagination = new
                    {
                        page,
                        pageSize,
                        total = await _notificationService.GetTotalCountAsync(userId),
                        unread = await _notificationService.GetUnreadCountAsync(userId)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = GetUserId();
                var count = await _notificationService.GetUnreadCountAsync(userId);

                return Ok(new
                {
                    success = true,
                    unreadCount = count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            try
            {
                await _notificationService.MarkAsReadAsync(id);

                return Ok(new
                {
                    success = true,
                    message = "Notification marked as read"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetUserId();
                await _notificationService.MarkAllAsReadAsync(userId);

                return Ok(new
                {
                    success = true,
                    message = "All notifications marked as read"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            try
            {
                await _notificationService.DeleteNotificationAsync(id);

                return Ok(new
                {
                    success = true,
                    message = "Notification deleted"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            try
            {
                var userId = GetUserId();
                await _notificationService.DeleteAllNotificationsAsync(userId);

                return Ok(new
                {
                    success = true,
                    message = "All notifications deleted"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting all notifications");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationDto dto)
        {
            try
            {
                if (!Enum.IsDefined(typeof(NotificationType), dto.Type))
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Invalid notification type" 
                    });
                }

                var notification = await _notificationService.CreateNotificationAsync(
                    dto.UserId,
                    dto.Title,
                    dto.Message,
                    dto.Type,
                    dto.RelatedId
                );

                return Ok(new
                {
                    success = true,
                    message = "Notification created successfully",
                    notificationId = notification.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.UtcNow - dateTime;

            if (timeSpan.TotalDays > 30)
                return $"{(int)(timeSpan.TotalDays / 30)} months ago";
            if (timeSpan.TotalDays > 1)
                return $"{(int)timeSpan.TotalDays} days ago";
            if (timeSpan.TotalHours > 1)
                return $"{(int)timeSpan.TotalHours} hours ago";
            if (timeSpan.TotalMinutes > 1)
                return $"{(int)timeSpan.TotalMinutes} minutes ago";

            return "Just now";
        }

        public class CreateNotificationDto
        {
            public Guid UserId { get; set; }
            public string Title { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public NotificationType Type { get; set; }
            public Guid? RelatedId { get; set; }
        }
    }
}