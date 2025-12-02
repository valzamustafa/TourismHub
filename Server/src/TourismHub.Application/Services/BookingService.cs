using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services
{
    public class BookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IActivityRepository _activityRepository;

        public BookingService(IBookingRepository bookingRepository, IActivityRepository activityRepository)
        {
            _bookingRepository = bookingRepository;
            _activityRepository = activityRepository;
        }

        public async Task<List<Booking>> GetAllBookingsWithDetailsAsync()
        {
            return await _bookingRepository.GetAllWithDetailsAsync();
        }

        public async Task<Booking?> GetBookingByIdAsync(Guid id)
        {
            return await _bookingRepository.GetByIdAsync(id);
        }

        public async Task<List<Booking>> GetAllBookingsAsync()
        {
            return await _bookingRepository.GetAllAsync();
        }

        public async Task<List<Booking>> GetUserBookingsAsync(Guid userId)
        {
            return await _bookingRepository.GetByUserIdAsync(userId);
        }

        public async Task<List<Booking>> GetActivityBookingsAsync(Guid activityId)
        {
            return await _bookingRepository.GetByActivityIdAsync(activityId);
        }

        public async Task<List<Booking>> GetBookingsByStatusAsync(BookingStatus status)
        {
            return await _bookingRepository.GetByStatusAsync(status);
        }

       public async Task<Booking> CreateBookingAsync(Booking booking)
{
    try
    {
        Console.WriteLine($"📝 Creating booking for Activity: {booking.ActivityId}, User: {booking.UserId}");
        
        if (booking.Id == Guid.Empty)
            booking.Id = Guid.NewGuid();
        
        if (booking.CreatedAt == default)
            booking.CreatedAt = DateTime.UtcNow;
        
        if (booking.UpdatedAt == default)
            booking.UpdatedAt = DateTime.UtcNow;
        
        if (booking.Status == 0) 
        {
            booking.Status = BookingStatus.Pending;
        }
        
        if (booking.PaymentStatus == 0) 
        {
            booking.PaymentStatus = PaymentStatus.Pending;
        }
        var activity = await _activityRepository.GetByIdAsync(booking.ActivityId);
        if (activity == null)
        {
            throw new InvalidOperationException($"Activity with ID {booking.ActivityId} not found");
        }

        if (activity.AvailableSlots < booking.NumberOfPeople)
        {
            throw new InvalidOperationException($"Not enough available slots. Available: {activity.AvailableSlots}, Requested: {booking.NumberOfPeople}");
        }

        activity.AvailableSlots -= booking.NumberOfPeople;
        _activityRepository.Update(activity);

        Console.WriteLine($"✅ Booking prepared:");
        Console.WriteLine($"   ID: {booking.Id}");
        Console.WriteLine($"   Activity: {booking.ActivityId}");
        Console.WriteLine($"   User: {booking.UserId}");
        Console.WriteLine($"   People: {booking.NumberOfPeople}");
        Console.WriteLine($"   Price: {booking.TotalPrice}");
        Console.WriteLine($"   Status: {booking.Status}");
        Console.WriteLine($"   PaymentStatus: {booking.PaymentStatus}");
        
        await _bookingRepository.AddAsync(booking);
        await _bookingRepository.SaveChangesAsync();
        await _activityRepository.SaveChangesAsync();

        Console.WriteLine($"✅ Booking created successfully!");
        return booking;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error creating booking: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"❌ Inner exception: {ex.InnerException.Message}");
        }
        throw;
    }
}
        public async Task UpdateBookingStatusAsync(Guid id, BookingStatus status)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking != null)
            {
                booking.Status = status;
                _bookingRepository.Update(booking);
                await _bookingRepository.SaveChangesAsync();
            }
        }
    }
}