// Domain/Entities/StripeApiKey.cs
using System;

namespace TourismHub.Domain.Entities
{
    public class StripeApiKey
    {
        public Guid Id { get; set; }
        public string SecretKey { get; set; } = string.Empty;
        public string PublishableKey { get; set; } = string.Empty;
        public string KeyId { get; set; } = string.Empty;
        public string Environment { get; set; } = "test";
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsActive { get; set; }
        public string Description { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? LastUsed { get; set; }
        public int UsageCount { get; set; }
        public bool IsRevoked { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? RevokedBy { get; set; }
        public string? RevokedReason { get; set; }
        
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsValid => IsActive && !IsRevoked && !IsExpired;
        public int DaysRemaining => IsValid ? (ExpiresAt - DateTime.UtcNow).Days : 0;
    }
}