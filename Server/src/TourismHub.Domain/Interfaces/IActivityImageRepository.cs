using TourismHub.Domain.Entities;

namespace TourismHub.Domain.Interfaces
{
    public interface IActivityImageRepository
    {
        Task<ActivityImage?> GetByIdAsync(Guid id);
        Task<List<ActivityImage>> GetByActivityIdAsync(Guid activityId);
        Task AddAsync(ActivityImage image);
        void Delete(ActivityImage image);
        Task SaveChangesAsync();
    }
}