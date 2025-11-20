using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly TourismHubDbContext _context;

        public ReviewRepository(TourismHubDbContext context)
        {
            _context = context;
        }

        public async Task<Review?> GetByIdAsync(Guid id)
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Activity)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<List<Review>> GetAllAsync()
        {
            return await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Activity)
                .ToListAsync();
        }

        public async Task<List<Review>> GetByActivityIdAsync(Guid activityId)
        {
            return await _context.Reviews
                .Where(r => r.ActivityId == activityId)
                .Include(r => r.User)
                .ToListAsync();
        }

        public async Task<List<Review>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Reviews
                .Where(r => r.UserId == userId)
                .Include(r => r.Activity)
                .ToListAsync();
        }

        public async Task<double> GetAverageRatingAsync(Guid activityId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ActivityId == activityId)
                .ToListAsync();

            return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
        }

        public async Task AddAsync(Review review)
        {
            await _context.Reviews.AddAsync(review);
        }

        public void Update(Review review)
        {
            _context.Reviews.Update(review);
        }

        public void Delete(Review review)
        {
            _context.Reviews.Remove(review);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}