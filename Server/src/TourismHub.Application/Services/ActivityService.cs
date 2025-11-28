using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using TourismHub.Domain.Enums;

namespace TourismHub.Application.Services
{
    public class ActivityService
    {
        private readonly IActivityRepository _activityRepository;

        public ActivityService(IActivityRepository activityRepository)
        {
            _activityRepository = activityRepository;
        }

        public async Task<List<Activity>> GetActivitiesByProviderAsync(Guid providerId)
        {
            return await _activityRepository.GetByProviderIdAsync(providerId);
        }

        public async Task<List<Activity>> GetAllActivitiesAsync()
        {
            return await _activityRepository.GetAllAsync();
        }

        public async Task<Activity?> GetActivityByIdAsync(Guid id)
        {
            return await _activityRepository.GetByIdAsync(id);
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

        public async Task UpdateActivityAsync(Activity activity)
        {
            _activityRepository.Update(activity);
            await _activityRepository.SaveChangesAsync();
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