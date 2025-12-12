using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
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
    var activities = await _activityRepository.GetByProviderIdAsync(providerId);
    
   
    var delayedActivities = activities.Where(a => a.Status == ActivityStatus.Delayed).ToList();
    _logger.LogInformation($"Service: Found {delayedActivities.Count} delayed activities for provider {providerId}");
    foreach (var delayed in delayedActivities)
    {
        _logger.LogInformation($"Service Delayed: {delayed.Name}, DelayedDate: {delayed.DelayedDate}, RescheduledStartDate: {delayed.RescheduledStartDate}, RescheduledEndDate: {delayed.RescheduledEndDate}");
    }
    
    return activities;
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

            activity.CreatedAt = DateTime.UtcNow;
            activity.UpdatedAt = DateTime.UtcNow;

            await _activityRepository.AddAsync(activity);
            await _activityRepository.SaveChangesAsync();
            return activity;
        }

      public async Task<Activity> UpdateActivityAsync(Activity activity)
{
    try
    {
        _logger.LogInformation($"=== SERVICE: Updating activity {activity.Id} ===");
        _logger.LogInformation($"Incoming Status: {activity.Status}");
        _logger.LogInformation($"Incoming DelayedDate: {activity.DelayedDate}");
        
        var existingActivity = await _activityRepository.GetByIdAsync(activity.Id);
        if (existingActivity == null)
            throw new Exception($"Activity with ID {activity.Id} not found");

       
        existingActivity.Status = activity.Status;
        
     
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
        existingActivity.ProviderName = activity.ProviderName;
        
     
        existingActivity.StartDate = activity.StartDate;
        existingActivity.EndDate = activity.EndDate;
        
        existingActivity.DelayedDate = activity.DelayedDate;
        existingActivity.RescheduledStartDate = activity.RescheduledStartDate;
        existingActivity.RescheduledEndDate = activity.RescheduledEndDate;
        
        existingActivity.UpdatedAt = DateTime.UtcNow;

        
        await _activityRepository.UpdateAsync(existingActivity);
        await _activityRepository.SaveChangesAsync();
        
        _logger.LogInformation($"=== SERVICE: Successfully updated activity {activity.Id} ===");
        _logger.LogInformation($"Final Status: {existingActivity.Status}");
        _logger.LogInformation($"Final DelayedDate: {existingActivity.DelayedDate}");
        
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

        public async Task<List<Activity>> SearchActivitiesAsync(string searchTerm)
        {
            var activities = await _activityRepository.GetAllAsync();
            return activities.Where(a => 
                a.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                a.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                a.Location.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

        public async Task<List<Activity>> GetActivitiesByStatusAsync(ActivityStatus status)
        {
            var activities = await _activityRepository.GetAllAsync();
            return activities.Where(a => a.Status == status).ToList();
        }

        public async Task<bool> CheckSlotAvailabilityAsync(Guid activityId, int requestedSlots)
        {
            var activity = await _activityRepository.GetByIdAsync(activityId);
            if (activity == null) return false;
            
            return activity.AvailableSlots >= requestedSlots;
        }

        public async Task ReduceAvailableSlotsAsync(Guid activityId, int slotsToReduce)
        {
            var activity = await _activityRepository.GetByIdAsync(activityId);
            if (activity != null)
            {
                activity.AvailableSlots -= slotsToReduce;
                if (activity.AvailableSlots < 0) activity.AvailableSlots = 0;
                
                activity.UpdatedAt = DateTime.UtcNow;
                await _activityRepository.UpdateAsync(activity);
                await _activityRepository.SaveChangesAsync();
            }
        }
    }
}