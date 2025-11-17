using System;

namespace TourismHub.Entities
{
    public class Review
    {
        public Guid Id { get; set; }
        public Guid ActivityId { get; set; }
        public Guid UserId { get; set; }
        public int Rating { get; set; }
        public required string Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

     
        public Activity Activity { get; set; }=null!;
        public User User { get; set; }=null!;
    }
}
