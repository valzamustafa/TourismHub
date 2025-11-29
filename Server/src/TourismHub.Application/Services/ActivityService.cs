using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using TourismHub.Application.DTOs.Activity;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

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

        public async Task<Activity> CreateActivityAsync(Activity activity)
        {
            await _activityRepository.AddAsync(activity);
            await _activityRepository.SaveChangesAsync();
            return activity;
        }

        public async Task<Activity> UpdateActivityAsync(Activity activity)
        {
            try
            {
                _logger.LogInformation($"=== SERVICE: Updating activity {activity.Id} ===");
                
                var existingActivity = await _activityRepository.GetByIdAsync(activity.Id);
                if (existingActivity == null)
                    throw new Exception($"Activity with ID {activity.Id} not found");

                existingActivity.Name = activity.Name;
                existingActivity.Description = activity.Description;
                existingActivity.Price = activity.Price;
                existingActivity.AvailableSlots = activity.AvailableSlots;
                existingActivity.Location = activity.Location;
                existingActivity.CategoryId = activity.CategoryId;
                existingActivity.UpdatedAt = DateTime.UtcNow;

                await _activityRepository.UpdateAsync(existingActivity);
                
                _logger.LogInformation($"=== SERVICE: Successfully updated activity {activity.Id} ===");
                
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
    }
}