using System.ComponentModel.DataAnnotations;

namespace TourismHub.Application.Dtos.Payment
{
    public class PaymentIntentCreateDto
    {
        [Required]
        public long Amount { get; set; }
        
        [Required]
        public string Currency { get; set; } = "usd";
        
        [Required]
        public Guid ActivityId { get; set; }
        
        [Required]
        public string BookingDate { get; set; } = string.Empty;
        
        [Required]
        [Range(1, 50)]
        public int NumberOfPeople { get; set; }
        
        [EmailAddress]
        public string? CustomerEmail { get; set; }
    }
}