using System;

namespace TourismHub.Entities
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
