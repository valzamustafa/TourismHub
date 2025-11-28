using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Infrastructure.Repositories
{
    public class ActivityRepository : IActivityRepository
    {
        private readonly TourismHubDbContext _context;

        public ActivityRepository(TourismHubDbContext context)
        {
            _context = context;
        }

        public async Task<Activity?> GetByIdAsync(Guid id)
        {
            return await _context.Activities
                .Include(a => a.Provider)
                .Include(a => a.Images)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Activity>> GetAllAsync()
        {
            return await _context.Activities
                .Include(a => a.Provider)
                .Include(a => a.Images)
                .ToListAsync();
        }

        public async Task<List<Activity>> GetByStatusAsync(ActivityStatus status)
        {
            return await _context.Activities
                .Where(a => a.Status == status)
                .Include(a => a.Provider)
                .ToListAsync();
        }

        public async Task<List<Activity>> GetByProviderIdAsync(Guid providerId)
        {
            return await _context.Activities
                .Where(a => a.ProviderId == providerId)
                .Include(a => a.Images)
                .ToListAsync();
        }

       public async Task<List<Activity>> GetByCategoryAsync(Guid categoryId)
{
    return await _context.Activities
        .Where(a => a.CategoryId == categoryId)
        .Include(a => a.Provider)
        .Include(a => a.Images)
        .Include(a => a.Category) 
        .ToListAsync();
}
        public async Task AddAsync(Activity activity)
        {
            await _context.Activities.AddAsync(activity);
        }

        public void Update(Activity activity)
        {
            _context.Activities.Update(activity);
        }

        public void Delete(Activity activity)
        {
            _context.Activities.Remove(activity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}