// TourismHub.Application.Services.ActivityService.cs
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TourismHub.Domain.Enums;

namespace TourismHub.Application.Services
{
    public class ActivityService
    {
        private readonly IActivityRepository _activityRepository;
        private readonly ILogger<ActivityService> _logger;

        public ActivityService(IActivityRepository activityRepository, ILogger<ActivityService> logger)
        {
            _activityRepository = activityRepository;
            _logger = logger;
        }

        public async Task<List<Activity>> GetAllActivitiesAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving all activities from repository");
                var activities = await _activityRepository.GetAllAsync();
                _logger.LogInformation($"Retrieved {activities.Count} activities");
                return activities;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activities from repository");
                throw;
            }
        }

        public async Task<Activity?> GetActivityByIdAsync(Guid id)
        {
            return await _activityRepository.GetByIdAsync(id);
        }

        public async Task<List<Activity>> GetActivitiesByProviderAsync(Guid providerId)
        {
            return await _activityRepository.GetByProviderIdAsync(providerId);
        }

        public async Task<List<Activity>> GetActivitiesByCategoryAsync(Guid categoryId)
        {
            return await _activityRepository.GetByCategoryAsync(categoryId);
        }

        public async Task<List<Activity>> GetUpcomingActivitiesAsync()
        {
            var activities = await _activityRepository.GetAllAsync();
            return activities.Where(a => a.IsUpcoming).ToList();
        }

        public async Task<List<Activity>> GetActiveActivitiesAsync()
        {
            var activities = await _activityRepository.GetAllAsync();
            return activities.Where(a => a.IsActive).ToList();
        }

        public async Task<List<Activity>> GetExpiredActivitiesAsync()
        {
            var activities = await _activityRepository.GetAllAsync();
            return activities.Where(a => a.IsExpired).ToList();
        }

    
public async Task<Activity> CreateActivityAsync(Activity activity)
{

    if (activity.EndDate < DateTime.UtcNow)
    {
        activity.Status = ActivityStatus.Expired;
    }
    else if (activity.StartDate <= DateTime.UtcNow && activity.EndDate >= DateTime.UtcNow)
    {
        activity.Status = ActivityStatus.Active;
    }
    else
    {
        activity.Status = ActivityStatus.Active;
    }

    await _activityRepository.AddAsync(activity);
    await _activityRepository.SaveChangesAsync();
    return activity;
}

       public async Task<Activity> UpdateActivityAsync(Activity activity)
{
    try
    {
        _logger.LogInformation($"=== SERVICE: Updating activity {activity.Id} with status {activity.Status} ===");
        
        var existingActivity = await _activityRepository.GetByIdAsync(activity.Id);
        if (existingActivity == null)
            throw new Exception($"Activity with ID {activity.Id} not found");

        var oldStatus = existingActivity.Status;
        
        existingActivity.Name = activity.Name;
        existingActivity.Description = activity.Description;
        existingActivity.Price = activity.Price;
        existingActivity.AvailableSlots = activity.AvailableSlots;
        existingActivity.Location = activity.Location;
        existingActivity.CategoryId = activity.CategoryId;
        existingActivity.Duration = activity.Duration;
        existingActivity.Included = activity.Included;
        existingActivity.Requirements = activity.Requirements;
        existingActivity.QuickFacts = activity.QuickFacts;
       
        if (activity.StartDate != default)
            existingActivity.StartDate = activity.StartDate;
        if (activity.EndDate != default)
            existingActivity.EndDate = activity.EndDate;
        
        existingActivity.Status = activity.Status;
       
        if (activity.Status == default || activity.Status == ActivityStatus.Pending)
        {
           
            if (existingActivity.EndDate < DateTime.UtcNow)
            {
                existingActivity.Status = ActivityStatus.Expired;
            }
            else if (existingActivity.StartDate <= DateTime.UtcNow && existingActivity.EndDate >= DateTime.UtcNow)
            {
                existingActivity.Status = ActivityStatus.Active;
            }
        }

        existingActivity.UpdatedAt = DateTime.UtcNow;

        await _activityRepository.UpdateAsync(existingActivity);
        
        _logger.LogInformation($"=== SERVICE: Successfully updated activity {activity.Id}. Old status: {oldStatus}, New status: {existingActivity.Status} ===");
        
        return existingActivity;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"=== SERVICE ERROR: Failed to update activity {activity.Id} ===");
        throw;
    }
}
        public async Task DeleteActivityAsync(Guid id)
        {
            var activity = await _activityRepository.GetByIdAsync(id);
            if (activity != null)
            {
                _activityRepository.Delete(activity);
                await _activityRepository.SaveChangesAsync();
            }
        }

        public async Task UpdateExpiredActivitiesAsync()
        {
            var activities = await _activityRepository.GetAllAsync();
            var now = DateTime.UtcNow;
            
            foreach (var activity in activities)
            {
                if (activity.EndDate < now && activity.Status != ActivityStatus.Expired)
                {
                    activity.Status = ActivityStatus.Expired;
                    activity.UpdatedAt = now;
                    await _activityRepository.UpdateAsync(activity);
                    _logger.LogInformation($"Activity {activity.Id} marked as expired.");
                }
            }
        }
    }
}