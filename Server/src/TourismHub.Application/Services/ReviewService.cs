using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services
{
    public class ReviewService
    {
        private readonly IReviewRepository _reviewRepository;

        public ReviewService(IReviewRepository reviewRepository)
        {
            _reviewRepository = reviewRepository;
        }

        public async Task<Review?> GetReviewByIdAsync(Guid id)
        {
            return await _reviewRepository.GetByIdAsync(id);
        }

        public async Task<List<Review>> GetAllReviewsAsync()
        {
            return await _reviewRepository.GetAllAsync();
        }

        public async Task<List<Review>> GetActivityReviewsAsync(Guid activityId)
        {
            return await _reviewRepository.GetByActivityIdAsync(activityId);
        }

        public async Task<List<Review>> GetUserReviewsAsync(Guid userId)
        {
            return await _reviewRepository.GetByUserIdAsync(userId);
        }

        public async Task<double> GetActivityAverageRatingAsync(Guid activityId)
        {
            return await _reviewRepository.GetAverageRatingAsync(activityId);
        }

        public async Task<Review> CreateReviewAsync(Review review)
        {
            if (review.Rating < 1 || review.Rating > 5)
            {
                throw new ArgumentException("Rating must be between 1 and 5");
            }

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.SaveChangesAsync();
            return review;
        }

        public async Task UpdateReviewAsync(Review review)
        {
            if (review.Rating < 1 || review.Rating > 5)
            {
                throw new ArgumentException("Rating must be between 1 and 5");
            }

            _reviewRepository.Update(review);
            await _reviewRepository.SaveChangesAsync();
        }

        public async Task DeleteReviewAsync(Guid id)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review != null)
            {
                _reviewRepository.Delete(review);
                await _reviewRepository.SaveChangesAsync();
            }
        }
    }
}