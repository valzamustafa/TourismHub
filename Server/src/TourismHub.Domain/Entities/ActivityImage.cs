using System;

namespace TourismHub.Domain.Entities
{
    public class ActivityImage
    {
        public Guid Id { get; set; }
        public Guid ActivityId { get; set; }
        public required string ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Activity Activity { get; set; }=null!;
    }
}
