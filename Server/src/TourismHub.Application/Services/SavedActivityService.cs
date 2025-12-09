using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TourismHub.Application.DTOs.SavedActivity;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Application.Services
{
    public interface ISavedActivityService
    {
        Task<SavedActivityDto> SaveActivityAsync(Guid userId, Guid activityId);
        Task<bool> UnsaveActivityAsync(Guid userId, Guid activityId);
        Task<List<SavedActivityDto>> GetUserSavedActivitiesAsync(Guid userId);
        Task<bool> IsActivitySavedAsync(Guid userId, Guid activityId);
         Task<IEnumerable<SavedActivity>> GetRecentlySavedActivitiesAsync(Guid userId, int count);
        Task<int> GetSavedActivitiesCountAsync(Guid userId);
    }

    public class SavedActivityService : ISavedActivityService
    {
        private readonly TourismHubDbContext _context;

        public SavedActivityService(TourismHubDbContext context)
        {
            _context = context;
        }

        public async Task<SavedActivityDto> SaveActivityAsync(Guid userId, Guid activityId)
        {
      
            var existing = await _context.SavedActivities
                .FirstOrDefaultAsync(s => s.UserId == userId && s.ActivityId == activityId);
            
            if (existing != null)
                throw new InvalidOperationException("Activity already saved");

            var activity = await _context.Activities
                .Include(a => a.Category)
                .Include(a => a.Images)
                .FirstOrDefaultAsync(a => a.Id == activityId);
            
            if (activity == null)
                throw new InvalidOperationException("Activity not found");

            var savedActivity = new SavedActivity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ActivityId = activityId,
                SavedAt = DateTime.UtcNow
            };

            _context.SavedActivities.Add(savedActivity);
            await _context.SaveChangesAsync();

            var mainImage = activity.Images?.FirstOrDefault()?.ImageUrl;

            return new SavedActivityDto
            {
                Id = savedActivity.Id,
                UserId = userId,
                ActivityId = activityId,
                ActivityName = activity.Name,
                ActivityImage = mainImage ?? string.Empty, 
                ActivityPrice = activity.Price,
                ActivityLocation = activity.Location,
                ActivityCategory = activity.Category?.Name ?? "Unknown",
                SavedAt = savedActivity.SavedAt
            };
        }

        public async Task<bool> UnsaveActivityAsync(Guid userId, Guid activityId)
        {
            var savedActivity = await _context.SavedActivities
                .FirstOrDefaultAsync(s => s.UserId == userId && s.ActivityId == activityId);
            
            if (savedActivity == null)
                return false;

            _context.SavedActivities.Remove(savedActivity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<SavedActivityDto>> GetUserSavedActivitiesAsync(Guid userId)
        {
            return await _context.SavedActivities
                .Where(s => s.UserId == userId)
                .Include(s => s.Activity)
                    .ThenInclude(a => a.Category)
                .Include(s => s.Activity)
                    .ThenInclude(a => a.Images)
                .Select(s => new SavedActivityDto
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    ActivityId = s.ActivityId,
                    ActivityName = s.Activity.Name,
                    ActivityImage = s.Activity.Images.FirstOrDefault()!.ImageUrl ?? string.Empty,
                    ActivityLocation = s.Activity.Location,
                    ActivityCategory = s.Activity.Category!.Name ?? "Unknown", 
                    SavedAt = s.SavedAt
                })
                .ToListAsync();
        }

        public async Task<bool> IsActivitySavedAsync(Guid userId, Guid activityId)
        {
            return await _context.SavedActivities
                .AnyAsync(s => s.UserId == userId && s.ActivityId == activityId);
        }
        public async Task<IEnumerable<SavedActivity>> GetRecentlySavedActivitiesAsync(Guid userId, int count)
{
    try
    {
        if (count <= 0) 
            count = 5; 
        
        if (count > 50) 
            count = 50; 

        var recentlySaved = await _context.SavedActivities
            .Where(s => s.UserId == userId)
            .Include(s => s.Activity)
                .ThenInclude(a => a.Category)
            .Include(s => s.Activity)
                .ThenInclude(a => a.Images)
            .Include(s => s.Activity)
                .ThenInclude(a => a.Provider)
            .OrderByDescending(s => s.SavedAt)
            .Take(count)
            .ToListAsync();

        return recentlySaved;
    }
    catch (Exception ex)
    {
 
        Console.WriteLine($"Error getting recently saved activities: {ex.Message}");
        throw;
    }
}

public async Task<int> GetSavedActivitiesCountAsync(Guid userId)
{
    try
    {
        var count = await _context.SavedActivities
            .Where(s => s.UserId == userId)
            .CountAsync();

        return count;
    }
    catch (Exception ex)
    {
  
        Console.WriteLine($"Error getting saved activities count: {ex.Message}");
        return 0;
    }
}
    }
}