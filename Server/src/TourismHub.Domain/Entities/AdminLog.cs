using System;
using TourismHub.Domain.Enums;

namespace TourismHub.Domain.Entities
{
    public class AdminLog
    {
        public Guid Id { get; set; }
        public Guid AdminId { get; set; }
        public required string Action { get; set; }
        public AdminTargetType TargetType { get; set; }
        public Guid TargetId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User Admin { get; set; }=null!;
    }
}