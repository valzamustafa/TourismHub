using System;
using TourismHub.Domain.Enums;

namespace TourismHub.Domain.Entities
{
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public decimal Amount { get; set; }
        public Domain.Enums.PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public string? TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; } 

        // Navigation property
        public virtual Booking Booking { get; set; } = null!;
    }
}