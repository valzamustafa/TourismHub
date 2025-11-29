using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services
{
    public class ActivityImageService
    {
        private readonly IActivityImageRepository _imageRepository;

        public ActivityImageService(IActivityImageRepository imageRepository)
        {
            _imageRepository = imageRepository;
        }

        public async Task<ActivityImage?> GetImageByIdAsync(Guid id)
        {
            return await _imageRepository.GetByIdAsync(id);
        }

        public async Task<List<ActivityImage>> GetActivityImagesAsync(Guid activityId)
        {
            return await _imageRepository.GetByActivityIdAsync(activityId);
        }

        public async Task<ActivityImage> AddImageAsync(ActivityImage image)
        {
            await _imageRepository.AddAsync(image);
            await _imageRepository.SaveChangesAsync();
            return image;
        }

        public async Task DeleteImageAsync(Guid id)
        {
            var image = await _imageRepository.GetByIdAsync(id);
            if (image != null)
            {
                _imageRepository.Delete(image);
                await _imageRepository.SaveChangesAsync();
            }
        }

        public async Task DeleteAllActivityImagesAsync(Guid activityId)
        {
            var images = await _imageRepository.GetByActivityIdAsync(activityId);
            foreach (var image in images)
            {
                _imageRepository.Delete(image);
            }
            await _imageRepository.SaveChangesAsync();
        }
    }
}