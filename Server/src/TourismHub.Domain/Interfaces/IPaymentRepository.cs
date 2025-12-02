using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

namespace TourismHub.Domain.Interfaces
{
    public interface IPaymentRepository
    {
        Task<Payment?> GetByIdAsync(Guid id);
        Task<Payment?> GetByBookingIdAsync(Guid bookingId);
        Task<List<Payment>> GetAllAsync();
        Task<List<Payment>> GetByStatusAsync(PaymentStatus status); 
        Task AddAsync(Payment payment);
        void Update(Payment payment);
        void Delete(Payment payment);
        Task SaveChangesAsync(); 
    }
}