using System.ComponentModel.DataAnnotations;
using TourismHub.Domain.Enums;

namespace TourismHub.Application.Dtos.Payment
{
    public class PaymentCreateDto
    {
        [Required]
        public Guid BookingId { get; set; }
        
        [Required]
        [Range(0.01, 10000, ErrorMessage = "Amount must be between 0.01 and 10000")]
        public decimal Amount { get; set; }
        
        [Required]
        public PaymentMethod PaymentMethod { get; set; }
        
        public string? TransactionId { get; set; }
    }
}