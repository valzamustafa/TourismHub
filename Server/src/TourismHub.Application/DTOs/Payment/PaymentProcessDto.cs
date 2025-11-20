using System.ComponentModel.DataAnnotations;

namespace TourismHub.Application.Dtos.Payment
{
    public class PaymentProcessDto
    {
        [Required]
        public string TransactionId { get; set; } = string.Empty;
        
        [Required]
        public string PaymentGatewayResponse { get; set; } = string.Empty;
    }
}