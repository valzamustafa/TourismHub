using  TourismHub.Domain.Enums;

namespace TourismHub.Application.Dtos.Booking
{
    public class BookingViewDto
    {
        public Guid Id { get; set; }
        public Guid ActivityId { get; set; }
        public required  string ActivityName { get; set; }
        public DateTime BookingDate { get; set; }
        public int NumberOfPeople { get; set; }
        public BookingStatus Status { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
    }
}