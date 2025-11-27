namespace TourismHub.Application.DTOs.Booking
{
    public class BookingCreateDto
    {
        public Guid UserId { get; set; }
        public Guid ActivityId { get; set; }
        public DateTime BookingDate { get; set; }
        public int NumberOfPeople { get; set; }
    }
}