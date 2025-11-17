using System;
using System.Collections.Generic;
using TourismHub.Enums;

namespace TourismHub.Entities
{
    public class Activity
    {
        public Guid Id { get; set; }
        public Guid ProviderId { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public int AvailableSlots { get; set; }
        public required string Location { get; set; }
        public required string Category { get; set; }
        public ActivityStatus Status { get; set; } = ActivityStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

     
        public User Provider { get; set; }=null!;

 public ICollection<Review> Reviews { get; set; }=new List<Review>();
        public ICollection<ActivityImage> Images { get; set; }=new List<ActivityImage>();
    }
}
