// NotificationExtensions.cs
using Microsoft.AspNetCore.SignalR;
using TourismHub.API.Hubs;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

public static class NotificationExtensions
{
    public static async Task SendRealTimeNotification(this INotificationService notificationService,
        IHubContext<NotificationHub> hubContext, Guid userId, string title, string message,
        NotificationType type, Guid? relatedId = null)
    {
        try
        {
       
            var notification = await notificationService.CreateNotificationAsync(
                userId, title, message, type, relatedId
            );

            Console.WriteLine($"📝 Notification created in DB for user {userId}: {title}");

          
            var notificationData = new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                Type = notification.Type.ToString(),
                TypeValue = (int)notification.Type,
                notification.RelatedId,
                notification.IsRead,
                notification.CreatedAt,
                TimeAgo = GetTimeAgo(notification.CreatedAt)
            };

            await hubContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotification", notificationData);
            
            Console.WriteLine($"📤 Real-time notification sent to user {userId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error sending real-time notification: {ex.Message}");
            Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
        }
    }

    private static string GetTimeAgo(DateTime dateTime)
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
}