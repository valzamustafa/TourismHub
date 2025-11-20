using TourismHub.Domain.Entities;

namespace TourismHub.Domain.Interfaces
{
    public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(Guid id);
        Task<List<Review>> GetByActivityIdAsync(Guid activityId);
        Task<List<Review>> GetAllAsync();
        Task<List<Review>> GetByUserIdAsync(Guid userId);
        Task<double> GetAverageRatingAsync(Guid activityId);
        Task AddAsync(Review review);
        void Update(Review review);
        void Delete(Review review);
        Task SaveChangesAsync();
    }
}