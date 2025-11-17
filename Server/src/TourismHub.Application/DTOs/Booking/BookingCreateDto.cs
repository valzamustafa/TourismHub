namespace TourismHub.Application.Dtos.Booking
{
    public class BookingCreateDto
    {
        public Guid ActivityId { get; set; }
        public DateTime BookingDate { get; set; }
        public int NumberOfPeople { get; set; }
    }
}