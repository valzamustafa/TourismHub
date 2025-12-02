using System;
using System.Collections.Generic;
using TourismHub.Domain.Enums;

namespace TourismHub.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
           public required string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public string? ProfileImage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? LastLogin { get; set; }

      public virtual ICollection<SavedActivity> SavedActivities { get; set; } = new List<SavedActivity>();
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>(); // Nëse përdorim entitet të veçantë
    }
}