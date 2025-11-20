using System.ComponentModel.DataAnnotations;
using TourismHub.Domain.Enums;

namespace TourismHub.Application.Dtos.Booking
{
    public class BookingStatusUpdateDto
    {
        [Required]
        public BookingStatus Status { get; set; }
    }
}