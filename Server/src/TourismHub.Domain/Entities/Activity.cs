using System;
using System.Collections.Generic;
using TourismHub.Domain.Enums;

namespace TourismHub.Domain.Entities
{
    public class Activity
    {
        public Guid Id { get; set; }
        public Guid? ProviderId { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public int AvailableSlots { get; set; }
        public required string Location { get; set; }
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        public ActivityStatus Status { get; set; } = ActivityStatus.Pending;
        
        public string ProviderName { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string Included { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public string QuickFacts { get; set; } = string.Empty;
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        public DateTime? DelayedDate { get; set; }
        public DateTime? RescheduledStartDate { get; set; }
        public DateTime? RescheduledEndDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public User Provider { get; set; } = null!;
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<ActivityImage> Images { get; set; } = new List<ActivityImage>();
        public virtual ICollection<SavedActivity> SavedActivities { get; set; } = new List<SavedActivity>();
        
        public bool IsActive => Status == ActivityStatus.Active && EndDate > DateTime.UtcNow;
        public bool IsExpired => EndDate < DateTime.UtcNow;
        public bool IsUpcoming => StartDate > DateTime.UtcNow && EndDate > DateTime.UtcNow;
        
        public DateTime? ExpectedStartDate => Status == ActivityStatus.Delayed && RescheduledStartDate.HasValue 
            ? RescheduledStartDate.Value 
            : StartDate;
            
        public DateTime? ExpectedEndDate => Status == ActivityStatus.Delayed && RescheduledEndDate.HasValue 
            ? RescheduledEndDate.Value 
            : EndDate;
    }
}