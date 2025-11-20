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
           
            var activity = await _activityRepository.GetByIdAsync(booking.ActivityId);
            if (activity == null)
            {
                throw new InvalidOperationException("Activity not found");
            }

            if (activity.AvailableSlots < booking.NumberOfPeople)
            {
                throw new InvalidOperationException("Not enough available slots");
            }

          
            activity.AvailableSlots -= booking.NumberOfPeople;
            _activityRepository.Update(activity);

            await _bookingRepository.AddAsync(booking);
            await _bookingRepository.SaveChangesAsync();
            await _activityRepository.SaveChangesAsync();

            return booking;
        }

        public async Task UpdateBookingAsync(Booking booking)
        {
            _bookingRepository.Update(booking);
            await _bookingRepository.SaveChangesAsync();
        }

        public async Task DeleteBookingAsync(Guid id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            if (booking != null)
            {
             
                var activity = await _activityRepository.GetByIdAsync(booking.ActivityId);
                if (activity != null)
                {
                    activity.AvailableSlots += booking.NumberOfPeople;
                    _activityRepository.Update(activity);
                }

                _bookingRepository.Delete(booking);
                await _bookingRepository.SaveChangesAsync();
                await _activityRepository.SaveChangesAsync();
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