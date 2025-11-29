using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services;
using TourismHub.Application.DTOs.ActivityImage;
using TourismHub.Domain.Entities;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityImagesController : ControllerBase
    {
        private readonly ImageUploadService _imageUploadService;
        private readonly ActivityImageService _activityImageService;
        private readonly ILogger<ActivityImagesController> _logger;

        public ActivityImagesController(
            ImageUploadService imageUploadService,
            ActivityImageService activityImageService,
            ILogger<ActivityImagesController> logger)
        {
            _imageUploadService = imageUploadService;
            _activityImageService = activityImageService;
            _logger = logger;
        }

        [HttpGet("activity/{activityId}")]
        public async Task<IActionResult> GetActivityImages(Guid activityId)
        {
            try
            {
                var images = await _activityImageService.GetActivityImagesAsync(activityId);
                
                var result = images.Select(img => new ActivityImageViewDto
                {
                    Id = img.Id,
                    ActivityId = img.ActivityId,
                    ImageUrl = img.ImageUrl,
                    CreatedAt = img.CreatedAt
                }).ToList();

                return Ok(new { 
                    success = true, 
                    data = result,
                    count = result.Count 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting activity images for activity {ActivityId}", activityId);
                return StatusCode(500, new { 
                    success = false, 
                    message = "An error occurred while retrieving images" 
                });
            }
        }

        [HttpPost("upload/{activityId}")]
        public async Task<IActionResult> UploadImage(Guid activityId, [FromForm] ActivityImageUploadDto uploadDto)
        {
            try
            {
                if (uploadDto.Image == null || uploadDto.Image.Length == 0)
                    return BadRequest(new { 
                        success = false, 
                        message = "No image file provided" 
                    });

                var imageUrl = await _imageUploadService.UploadImageAsync(uploadDto.Image);

                var activityImage = await _imageUploadService.SaveImageToDatabaseAsync(activityId, imageUrl);

                var result = new ActivityImageViewDto
                {
                    Id = activityImage.Id,
                    ActivityId = activityImage.ActivityId,
                    ImageUrl = imageUrl,
                    CreatedAt = activityImage.CreatedAt
                };

                _logger.LogInformation("Image uploaded successfully for activity {ActivityId}", activityId);

                return Ok(new { 
                    success = true, 
                    message = "Image uploaded successfully", 
                    data = result 
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = ex.Message 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image for activity {ActivityId}", activityId);
                return StatusCode(500, new { 
                    success = false, 
                    message = "An error occurred while uploading the image" 
                });
            }
        }

        [HttpPost("upload-multiple/{activityId}")]
        public async Task<IActionResult> UploadMultipleImages(Guid activityId, [FromForm] List<IFormFile> images)
        {
            try
            {
                if (images == null || images.Count == 0)
                    return BadRequest(new { 
                        success = false, 
                        message = "No images provided" 
                    });

                var uploadedImages = new List<ActivityImageViewDto>();
                var errors = new List<string>();

                foreach (var image in images)
                {
                    try
                    {
                        if (image.Length > 0)
                        {
                            var imageUrl = await _imageUploadService.UploadImageAsync(image);
                            var activityImage = await _imageUploadService.SaveImageToDatabaseAsync(activityId, imageUrl);

                            uploadedImages.Add(new ActivityImageViewDto
                            {
                                Id = activityImage.Id,
                                ActivityId = activityImage.ActivityId,
                                ImageUrl = imageUrl,
                                CreatedAt = activityImage.CreatedAt
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Failed to upload {image.FileName}: {ex.Message}");
                        _logger.LogError(ex, "Error uploading image {FileName}", image.FileName);
                    }
                }

                var response = new
                {
                    success = uploadedImages.Count > 0,
                    message = uploadedImages.Count > 0 ? 
                             $"{uploadedImages.Count} images uploaded successfully" : 
                             "No images were uploaded successfully",
                    data = uploadedImages,
                    errors = errors
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading multiple images for activity {ActivityId}", activityId);
                return StatusCode(500, new { 
                    success = false, 
                    message = "An error occurred while uploading images" 
                });
            }
        }

        [HttpDelete("{imageId}")]
        public async Task<IActionResult> DeleteImage(Guid imageId)
        {
            try
            {
                var image = await _activityImageService.GetImageByIdAsync(imageId);
                if (image == null)
                    return NotFound(new { 
                        success = false, 
                        message = "Image not found" 
                    });

                _imageUploadService.DeletePhysicalImage(image.ImageUrl);

                await _activityImageService.DeleteImageAsync(imageId);

                _logger.LogInformation("Image {ImageId} deleted successfully", imageId);

                return Ok(new { 
                    success = true, 
                    message = "Image deleted successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image {ImageId}", imageId);
                return StatusCode(500, new { 
                    success = false, 
                    message = "An error occurred while deleting the image" 
                });
            }
        }

        [HttpDelete("activity/{activityId}")]
        public async Task<IActionResult> DeleteAllActivityImages(Guid activityId)
        {
            try
            {
                var images = await _activityImageService.GetActivityImagesAsync(activityId);
                
                foreach (var image in images)
                {
                    _imageUploadService.DeletePhysicalImage(image.ImageUrl);
                }

                await _activityImageService.DeleteAllActivityImagesAsync(activityId);

                _logger.LogInformation("All images for activity {ActivityId} deleted successfully", activityId);

                return Ok(new { 
                    success = true, 
                    message = $"All {images.Count} images deleted successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting all images for activity {ActivityId}", activityId);
                return StatusCode(500, new { 
                    success = false, 
                    message = "An error occurred while deleting images" 
                });
            }
        }
    }
}