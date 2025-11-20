using System.ComponentModel.DataAnnotations;
using TourismHub.Domain.Enums;

namespace TourismHub.Application.Dtos.Payment
{
    public class PaymentStatusUpdateDto
    {
        [Required]
        public PaymentStatus PaymentStatus { get; set; }
        
        public string? TransactionId { get; set; }
    }
}