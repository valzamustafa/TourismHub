using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

namespace TourismHub.Application.Services
{
    public class NotificationHelper
    {
        private readonly INotificationService _notificationService;

        public NotificationHelper(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }


        public async Task NotifyBookingCreated(Guid userId, Guid bookingId, string activityName)
        {
            await _notificationService.CreateNotificationAsync(
                userId,
                "Booking Confirmed",
                $"Your booking for '{activityName}' has been confirmed",
                NotificationType.Booking,
                bookingId
            );
        }

        public async Task NotifyBookingStatusChanged(Guid userId, Guid bookingId, string activityName, string status)
        {
            await _notificationService.CreateNotificationAsync(
                userId,
                "Booking Status Updated",
                $"Your booking for '{activityName}' is now {status}",
                NotificationType.Booking,
                bookingId
            );
        }

        public async Task NotifyBookingCancelled(Guid userId, Guid bookingId, string activityName)
        {
            await _notificationService.CreateNotificationAsync(
                userId,
                "Booking Cancelled",
                $"Your booking for '{activityName}' has been cancelled",
                NotificationType.Booking,
                bookingId
            );
        }

        public async Task NotifyNewMessage(Guid userId, Guid chatId, string senderName)
        {
            await _notificationService.CreateNotificationAsync(
                userId,
                "New Message",
                $"You have a new message from {senderName}",
                NotificationType.Message,
                chatId
            );
        }

      
        public async Task NotifyNewBookingForProvider(Guid providerId, Guid bookingId, string activityName, string touristName)
        {
            await _notificationService.CreateNotificationAsync(
                providerId,
                "New Booking",
                $"{touristName} booked your activity '{activityName}'",
                NotificationType.Activity,
                bookingId
            );
        }

        public async Task NotifyActivityStatusChanged(Guid providerId, Guid activityId, string activityName, string status)
        {
            await _notificationService.CreateNotificationAsync(
                providerId,
                "Activity Status Updated",
                $"Your activity '{activityName}' is now {status}",
                NotificationType.Activity,
                activityId
            );
        }

     
        public async Task NotifyPaymentSuccess(Guid userId, Guid bookingId, decimal amount)
        {
            await _notificationService.CreateNotificationAsync(
                userId,
                "Payment Successful",
                $"Payment of ${amount} was successful",
                NotificationType.Payment,
                bookingId
            );
        }

        public async Task NotifyPaymentFailed(Guid userId, Guid bookingId, decimal amount)
        {
            await _notificationService.CreateNotificationAsync(
                userId,
                "Payment Failed",
                $"Payment of ${amount} failed. Please try again",
                NotificationType.Payment,
                bookingId
            );
        }

     
        public async Task NotifySystemMessage(Guid userId, string title, string message)
        {
            await _notificationService.CreateNotificationAsync(
                userId,
                title,
                message,
                NotificationType.System,
                null
            );
        }
    }
}