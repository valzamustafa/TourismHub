using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

namespace TourismHub.Domain.Interfaces
{
    public interface IActivityRepository
    {
        Task<Activity?> GetByIdAsync(Guid id);
        Task<List<Activity>> GetAllAsync();
        Task<List<Activity>> GetByStatusAsync(ActivityStatus status);
        Task<List<Activity>> GetByProviderIdAsync(Guid providerId);
         Task<List<Activity>> GetByCategoryAsync(string category);
        Task AddAsync(Activity activity);
        void Update(Activity activity);
        void Delete(Activity activity);
        Task SaveChangesAsync();
    }
}