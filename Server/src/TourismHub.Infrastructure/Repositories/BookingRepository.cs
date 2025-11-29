using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Infrastructure.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly TourismHubDbContext _context;

        public BookingRepository(TourismHubDbContext context)
        {
            _context = context;
        }

        public async Task<Booking?> GetByIdAsync(Guid id)
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Activity)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<List<Booking>> GetAllAsync()
        {
            return await _context.Bookings.ToListAsync();
        }

        public async Task<List<Booking>> GetAllWithDetailsAsync()
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Activity)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.Activity)
                .Include(b => b.Payment)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetByActivityIdAsync(Guid activityId)
        {
            return await _context.Bookings
                .Where(b => b.ActivityId == activityId)
                .Include(b => b.User)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetByStatusAsync(BookingStatus status)
        {
            return await _context.Bookings
                .Where(b => b.Status == status)
                .Include(b => b.User)
                .Include(b => b.Activity)
                .ToListAsync();
        }

        public async Task AddAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
        }

        public void Update(Booking booking)
        {
            _context.Bookings.Update(booking);
        }

        public void Delete(Booking booking)
        {
            _context.Bookings.Remove(booking);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}