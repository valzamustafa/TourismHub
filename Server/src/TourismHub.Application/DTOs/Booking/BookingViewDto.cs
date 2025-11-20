using TourismHub.Domain.Enums;

namespace TourismHub.Application.Dtos.Booking
{
    public class BookingViewDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public required string UserFullName { get; set; }
        public Guid ActivityId { get; set; }
        public required string ActivityName { get; set; }
        public decimal ActivityPrice { get; set; }
        public DateTime BookingDate { get; set; }
        public int NumberOfPeople { get; set; }
        public decimal TotalAmount { get; set; }
        public BookingStatus Status { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}