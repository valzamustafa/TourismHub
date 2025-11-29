using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

namespace TourismHub.Domain.Interfaces
{
    public interface IBookingRepository
    {
        Task<Booking?> GetByIdAsync(Guid id);
        Task<List<Booking>> GetAllAsync();
        Task<List<Booking>> GetAllWithDetailsAsync();
        Task<List<Booking>> GetByUserIdAsync(Guid userId);
        Task<List<Booking>> GetByActivityIdAsync(Guid activityId); 
        Task<List<Booking>> GetByStatusAsync(BookingStatus status);
        Task AddAsync(Booking booking);
        void Update(Booking booking);
        void Delete(Booking booking);
        Task SaveChangesAsync();
    }
}