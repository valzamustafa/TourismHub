using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;

namespace TourismHub.Infrastructure.Repositories
{
    public class ActivityRepository : IActivityRepository
    {
        private readonly TourismHubDbContext _context;
        private readonly ILogger<ActivityRepository> _logger;

        public ActivityRepository(TourismHubDbContext context, ILogger<ActivityRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Activity?> GetByIdAsync(Guid id)
        {
            return await _context.Activities
                .Include(a => a.Provider)
                .Include(a => a.Images)
                .Include(a => a.Category)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Activity>> GetAllAsync()
{
    try
    {
        _logger.LogInformation("=== REPOSITORY: Getting all activities from database ===");
        
        var activities = await _context.Activities
            .Include(a => a.Provider)
            .Include(a => a.Images)
            .Include(a => a.Category)
            .AsNoTracking()
            .ToListAsync();

        _logger.LogInformation($"=== REPOSITORY: Successfully retrieved {activities.Count} activities ===");
        return activities;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "=== REPOSITORY ERROR ===");
        throw;
    }
}
        public async Task<List<Activity>> GetByStatusAsync(ActivityStatus status)
        {
            return await _context.Activities
                .Where(a => a.Status == status)
                .Include(a => a.Provider)
                .Include(a => a.Images)
                .Include(a => a.Category)
                .ToListAsync();
        }

        public async Task<List<Activity>> GetByProviderIdAsync(Guid providerId)
        {
            return await _context.Activities
                .Where(a => a.ProviderId == providerId)
                .Include(a => a.Images)
                .Include(a => a.Category)
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

        public async Task UpdateAsync(Activity activity)
        {
            try
            {
                _context.Activities.Update(activity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating activity {activity.Id}");
                throw;
            }
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