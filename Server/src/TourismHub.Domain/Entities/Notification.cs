// Domain/Entities/Notification.cs (Ndrysho këtë)
using TourismHub.Domain.Enums;
namespace TourismHub.Domain.Entities
{
    public class Notification
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public required string Title { get; set; }
        public required string Message { get; set; }
        public NotificationType Type { get; set; } 
        public Guid? RelatedId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}