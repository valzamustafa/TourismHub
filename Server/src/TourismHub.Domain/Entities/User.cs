using System;
using System.Collections.Generic;
using System.Diagnostics;
using TourismHub.Domain.Enums;


namespace TourismHub.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public  required string Password { get; set; } 
        public UserRole Role { get; set; }
        public string? ProfileImage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


        public ICollection<Activity> Activities { get; set; }=new List<Activity>();
        public ICollection<Booking> Bookings { get; set; }=new List<Booking>();
        public ICollection<Review> Reviews { get; set; }=new List<Review>();
    }
}
