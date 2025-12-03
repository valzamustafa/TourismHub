using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace TourismHub.Application.Services
{
    public class BookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IActivityRepository _activityRepository;
        private readonly ILogger<BookingService> _logger;

        public BookingService(
            IBookingRepository bookingRepository, 
            IActivityRepository activityRepository,
            ILogger<BookingService> logger)
        {
            _bookingRepository = bookingRepository;
            _activityRepository = activityRepository;
            _logger = logger;
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


        public async Task<List<Booking>> GetBookingsByUserIdAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation($"Getting bookings for user: {userId}");
                
             
                var bookings = await _bookingRepository.GetByUserIdAsync(userId);
                
                if (bookings == null || !bookings.Any())
                {
                    _logger.LogInformation($"No bookings found for user: {userId}");
                    return new List<Booking>();
                }

                _logger.LogInformation($"Found {bookings.Count} bookings for user: {userId}");
                return bookings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting bookings for user {userId}");
                throw;
            }
        }

        public async Task<List<Booking>> GetActivityBookingsAsync(Guid activityId)
        {
            return await _bookingRepository.GetByActivityIdAsync(activityId);
        }

        public async Task<List<Booking>> GetBookingsByStatusAsync(BookingStatus status)
        {
            return await _bookingRepository.GetByStatusAsync(status);
        }


        public async Task<bool> CancelBookingAsync(Guid bookingId)
        {
            try
            {
                _logger.LogInformation($"Cancelling booking: {bookingId}");
                
                var booking = await _bookingRepository.GetByIdAsync(bookingId);
                
                if (booking == null)
                {
                    _logger.LogWarning($"Booking not found: {bookingId}");
                    return false;
                }

                
                if (booking.Status != BookingStatus.Pending)
                {
                    _logger.LogWarning($"Booking {bookingId} cannot be cancelled. Current status: {booking.Status}");
                    return false;
                }

          
                booking.Status = BookingStatus.Canceled; 
                booking.UpdatedAt = DateTime.UtcNow;
                
                _bookingRepository.Update(booking);
                await _bookingRepository.SaveChangesAsync();
                
                _logger.LogInformation($"Booking {bookingId} cancelled successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling booking {bookingId}");
                throw;
            }
        }


        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            try
            {
                _logger.LogInformation($"Creating booking for Activity: {booking.ActivityId}, User: {booking.UserId}");
                
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

             
                if (booking.TotalPrice == 0)
                {
                    booking.TotalPrice = activity.Price * booking.NumberOfPeople;
                }

                _logger.LogInformation($"✅ Booking prepared:");
                _logger.LogInformation($"   ID: {booking.Id}");
                _logger.LogInformation($"   Activity: {booking.ActivityId}");
                _logger.LogInformation($"   User: {booking.UserId}");
                _logger.LogInformation($"   People: {booking.NumberOfPeople}");
                _logger.LogInformation($"   Price: {booking.TotalPrice}");
                _logger.LogInformation($"   Status: {booking.Status}");
                _logger.LogInformation($"   PaymentStatus: {booking.PaymentStatus}");
                
                await _bookingRepository.AddAsync(booking);
                await _bookingRepository.SaveChangesAsync();
                await _activityRepository.SaveChangesAsync();

                _logger.LogInformation($"✅ Booking created successfully!");
                return booking;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error creating booking");
                throw;
            }
        }

       
        public async Task UpdateBookingStatusAsync(Guid id, BookingStatus status)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking != null)
            {
                booking.Status = status;
                booking.UpdatedAt = DateTime.UtcNow;
                _bookingRepository.Update(booking);
                await _bookingRepository.SaveChangesAsync();
            }
        }

       
        public async Task UpdatePaymentStatusAsync(Guid id, PaymentStatus status)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking != null)
            {
                booking.PaymentStatus = status;
                booking.UpdatedAt = DateTime.UtcNow;
                _bookingRepository.Update(booking);
                await _bookingRepository.SaveChangesAsync();
            }
        }

       
        public async Task<bool> DeleteBookingAsync(Guid id)
        {
            try
            {
                var booking = await _bookingRepository.GetByIdAsync(id);
                if (booking == null)
                    return false;

              
                if (booking.Status == BookingStatus.Confirmed || booking.Status == BookingStatus.Pending)
                {
                    var activity = await _activityRepository.GetByIdAsync(booking.ActivityId);
                    if (activity != null)
                    {
                        activity.AvailableSlots += booking.NumberOfPeople;
                        _activityRepository.Update(activity);
                        await _activityRepository.SaveChangesAsync();
                    }
                }

                _bookingRepository.Delete(booking);
                await _bookingRepository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting booking {id}");
                throw;
            }
        }

        // 
        public async Task<bool> BookingExistsAsync(Guid id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            return booking != null;
        }

        
        public async Task<List<Booking>> GetBookingsByUserIdWithDetailsAsync(Guid userId)
        {
            try
            {
                
                var allBookings = await _bookingRepository.GetAllWithDetailsAsync();
                
              
                var userBookings = allBookings
                    .Where(b => b.UserId == userId)
                    .OrderByDescending(b => b.BookingDate)
                    .ToList();

                return userBookings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting bookings with details for user {userId}");
                throw;
            }
        }
    }
}