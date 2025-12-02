// Domain/Entities/SavedActivity.cs
using System;

namespace TourismHub.Domain.Entities
{
    public class SavedActivity
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ActivityId { get; set; }
        public DateTime SavedAt { get; set; }
        

        public User User { get; set; }=null!;
        public Activity Activity { get; set; }=null!;
    }
}