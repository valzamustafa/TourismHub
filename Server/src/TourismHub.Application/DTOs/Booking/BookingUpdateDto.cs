using System.ComponentModel.DataAnnotations;

namespace TourismHub.Application.Dtos.Booking
{
    public class BookingUpdateDto
    {
        [Required]
        public DateTime BookingDate { get; set; }
        
        [Required]
        [Range(1, 50, ErrorMessage = "Number of people must be between 1 and 50")]
        public int NumberOfPeople { get; set; }
    }
}