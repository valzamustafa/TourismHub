using TourismHub.Domain.Enums;

namespace TourismHub.Application.Dtos.Payment
{
    public class PaymentViewDto
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string ActivityName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public string? TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public BookingStatus BookingStatus { get; set; }
    }
}