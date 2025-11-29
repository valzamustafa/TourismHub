using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace TourismHub.Application.Services
{
    public class ImageUploadService
    {
        private readonly IHostEnvironment _environment;
        private readonly ILogger<ImageUploadService> _logger;
        private readonly ActivityImageService _activityImageService;

        public ImageUploadService(
            IHostEnvironment environment,
            ILogger<ImageUploadService> logger,
            ActivityImageService activityImageService)
        {
            _environment = environment;
            _logger = logger;
            _activityImageService = activityImageService;
        }

        public async Task<string> UploadImageAsync(IFormFile imageFile, string folderName = "activity-images")
        {
            try
            {
                if (imageFile == null || imageFile.Length == 0)
                    throw new ArgumentException("No image file provided");

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };
                var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                    throw new ArgumentException("Invalid file type. Only images are allowed.");

                if (imageFile.Length > 5 * 1024 * 1024)
                    throw new ArgumentException("File size too large. Maximum size is 5MB.");

                var webRootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
                if (!Directory.Exists(webRootPath))
                {
                    Directory.CreateDirectory(webRootPath);
                    _logger.LogInformation($"Created wwwroot directory: {webRootPath}");
                }
                var uploadsFolder = Path.Combine(webRootPath, "uploads", folderName);
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                    _logger.LogInformation($"Created uploads directory: {uploadsFolder}");
                }

              
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

               
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }

                _logger.LogInformation($"Image uploaded successfully: {uniqueFileName}");

                return $"/uploads/{folderName}/{uniqueFileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                throw;
            }
        }

        public async Task<Domain.Entities.ActivityImage> SaveImageToDatabaseAsync(Guid activityId, string imageUrl)
        {
            var activityImage = new Domain.Entities.ActivityImage
            {
                Id = Guid.NewGuid(),
                ActivityId = activityId,
                ImageUrl = imageUrl,
                CreatedAt = DateTime.UtcNow
            };

            return await _activityImageService.AddImageAsync(activityImage);
        }

        public void DeletePhysicalImage(string imageUrl)
        {
            try
            {
                if (!string.IsNullOrEmpty(imageUrl) && imageUrl.StartsWith("/uploads/"))
                {
                    var webRootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
                    var physicalPath = Path.Combine(webRootPath, imageUrl.TrimStart('/'));
                    if (File.Exists(physicalPath))
                    {
                        File.Delete(physicalPath);
                        _logger.LogInformation($"Deleted physical image: {physicalPath}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting physical image");
            }
        }
    }
}