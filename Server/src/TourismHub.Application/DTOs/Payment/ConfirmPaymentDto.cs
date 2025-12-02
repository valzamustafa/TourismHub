using System.ComponentModel.DataAnnotations;

namespace TourismHub.Application.Dtos.Payment
{
    public class ConfirmPaymentDto
    {
        [Required]
        public Guid BookingId { get; set; }
        
        [Required]
        public string PaymentIntentId { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, 10000)]
        public decimal Amount { get; set; }
    }
}