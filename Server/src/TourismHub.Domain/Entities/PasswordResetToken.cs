using System;

namespace TourismHub.Domain.Entities
{
    public class PasswordResetToken
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public required string Token { get; set; }
        public DateTime Expires { get; set; }
        public DateTime Created { get; set; }
        public bool IsUsed { get; set; }
        public DateTime? UsedAt { get; set; }
        
        // Navigation property
        public virtual User User { get; set; } = null!;
    }
}