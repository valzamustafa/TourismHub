// TourismHub.Domain.Interfaces.IActivityRepository.cs
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TourismHub.Domain.Interfaces
{
    public interface IActivityRepository
    {
        Task<Activity?> GetByIdAsync(Guid id);
        Task<List<Activity>> GetAllAsync();
        Task<List<Activity>> GetByStatusAsync(ActivityStatus status);
        Task<List<Activity>> GetByProviderIdAsync(Guid providerId);
        Task<List<Activity>> GetByCategoryAsync(Guid categoryId);
        Task<List<Activity>> GetActiveActivitiesAsync(DateTime currentDate);
        Task<List<Activity>> GetExpiredActivitiesAsync(DateTime currentDate);
        Task<List<Activity>> GetUpcomingActivitiesAsync(DateTime currentDate);
        Task AddAsync(Activity activity);
        void Update(Activity activity);
        Task UpdateAsync(Activity activity);
        void Delete(Activity activity);
        Task SaveChangesAsync();
    }
}