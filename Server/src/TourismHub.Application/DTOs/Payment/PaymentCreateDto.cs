using TourismHub.Domain.Enums;

namespace TourismHub.Application.Dtos.Payment
{
    public class PaymentCreateDto
    {
        public Guid BookingId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
    }
}