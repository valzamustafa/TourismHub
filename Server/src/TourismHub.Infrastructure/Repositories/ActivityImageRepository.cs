using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Infrastructure.Repositories
{
    public class ActivityImageRepository : IActivityImageRepository
    {
        private readonly TourismHubDbContext _context;

        public ActivityImageRepository(TourismHubDbContext context)
        {
            _context = context;
        }

        public async Task<ActivityImage?> GetByIdAsync(Guid id)
        {
            return await _context.ActivityImages.FindAsync(id);
        }

        public async Task<List<ActivityImage>> GetByActivityIdAsync(Guid activityId)
        {
            return await _context.ActivityImages
                .Where(img => img.ActivityId == activityId)
                .ToListAsync();
        }

        public async Task AddAsync(ActivityImage image)
        {
            await _context.ActivityImages.AddAsync(image);
        }

        public void Delete(ActivityImage image)
        {
            _context.ActivityImages.Remove(image);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}