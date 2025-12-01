// TourismHub.API.Controllers.ActivitiesController.cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.Activity; 
using TourismHub.Domain.Enums; 
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivitiesController : ControllerBase
    {
        private readonly ActivityService _activityService;
        private readonly ImageUploadService _imageUploadService;
        private readonly ILogger<ActivitiesController> _logger;

        public ActivitiesController(
            ActivityService activityService, 
            ImageUploadService imageUploadService,
            ILogger<ActivitiesController> logger)
        {
            _activityService = activityService;
            _imageUploadService = imageUploadService;
            _logger = logger;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAllActivities()
        {
            try
            {
                _logger.LogInformation("=== CONTROLLER: Getting all activities ===");
                
                var activities = await _activityService.GetAllActivitiesAsync();
                
                _logger.LogInformation($"=== CONTROLLER: Successfully retrieved {activities.Count} activities ===");
                
                var result = activities.Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Description,
                    a.Price,
                    a.AvailableSlots,
                    a.Location,
                    a.CategoryId,
                    Category = a.Category?.Name ?? "Unknown",
                    ProviderName = a.Provider?.FullName ?? "Unknown Provider",
                    Duration = a.Duration,
                    Included = a.Included?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                    Requirements = a.Requirements?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                    QuickFacts = a.QuickFacts?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                 
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive,
                    IsExpired = a.IsExpired,
                    IsUpcoming = a.IsUpcoming,
                    
                    Status = a.Status.ToString(),
                    Images = a.Images?.Select(img => img.ImageUrl).ToList() ?? new List<string>(),
                    a.CreatedAt
                }).ToList();
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "=== CONTROLLER ERROR: Failed to get activities ===");
                
                return StatusCode(500, new { 
                    message = "Internal server error",
                    error = "Check server logs for details"
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetActivityById(Guid id)
        {
            try
            {
                var activity = await _activityService.GetActivityByIdAsync(id);
                if (activity == null)
                    return NotFound(new { message = "Activity not found" });

                var result = new
                {
                    activity.Id,
                    activity.Name,
                    activity.Description,
                    activity.Price,
                    activity.AvailableSlots,
                    activity.Location,
                    activity.CategoryId,
                    Category = activity.Category?.Name ?? "Unknown",
                    ProviderName = activity.Provider?.FullName ?? "Unknown Provider",
                    Duration = activity.Duration,
                    Included = activity.Included?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                    Requirements = activity.Requirements?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                    QuickFacts = activity.QuickFacts?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                   
                    StartDate = activity.StartDate,
                    EndDate = activity.EndDate,
                    IsActive = activity.IsActive,
                    IsExpired = activity.IsExpired,
                    IsUpcoming = activity.IsUpcoming,
                    
                    Status = activity.Status.ToString(),
                    Images = activity.Images?.Select(img => img.ImageUrl).ToList() ?? new List<string>()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetActivityById");
                return StatusCode(500, new { message = "An error occurred while retrieving the activity" });
            }
        }
[HttpPost]
public async Task<IActionResult> CreateActivity([FromForm] ActivityCreateDto createDto)
{
    try
    {
        _logger.LogInformation("=== CONTROLLER: Creating new activity ===");
        _logger.LogInformation("Received data: Name={Name}, CategoryId={CategoryId}, ProviderId={ProviderId}", 
            createDto.Name, createDto.CategoryId, createDto.ProviderId);

        if (!ModelState.IsValid)
        {
            _logger.LogError("Model validation failed: {@Errors}", 
                ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)));
            return BadRequest(new { 
                message = "Validation failed",
                errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
            });
        }


        _logger.LogInformation("Creating activity with: {@ActivityData}", new {
            createDto.Name,
            createDto.Description,
            createDto.Price,
            createDto.AvailableSlots,
            createDto.Location,
            createDto.CategoryId,
            createDto.Duration,
            createDto.ProviderId,
            createDto.ProviderName,
            createDto.StartDate,
            createDto.EndDate,
            ImageCount = createDto.Images?.Count ?? 0
        });

      var activity = new Activity
{
    Id = Guid.NewGuid(),
    Name = createDto.Name,
    Description = createDto.Description,
    Price = createDto.Price,
    AvailableSlots = createDto.AvailableSlots,
    Location = createDto.Location,
    CategoryId = createDto.CategoryId,
    Duration = createDto.Duration,
  
    Included = createDto.Included ?? string.Empty,
    Requirements = createDto.Requirements ?? string.Empty,
    QuickFacts = createDto.QuickFacts ?? string.Empty,
    
    ProviderId = (createDto.ProviderId == null || createDto.ProviderId == Guid.Empty) ? 
        null : createDto.ProviderId,
    
    ProviderName = createDto.ProviderName ?? string.Empty,
    
    StartDate = createDto.StartDate,
    EndDate = createDto.EndDate,
    
    CreatedAt = DateTime.UtcNow,
    UpdatedAt = DateTime.UtcNow
};
        if (createDto.EndDate < DateTime.UtcNow)
        {
            activity.Status = ActivityStatus.Expired;
        }
        else if (createDto.StartDate <= DateTime.UtcNow && createDto.EndDate >= DateTime.UtcNow)
        {
            activity.Status = ActivityStatus.Active;
        }
        else
        {
            activity.Status = ActivityStatus.Pending;
        }

        _logger.LogInformation("Calling CreateActivityAsync...");
        
        var createdActivity = await _activityService.CreateActivityAsync(activity);
        
        _logger.LogInformation("=== CONTROLLER: Activity created with ID: {ActivityId} ===", createdActivity.Id);

        if (createDto.Images != null && createDto.Images.Count > 0)
        {
            _logger.LogInformation("Uploading {ImageCount} images", createDto.Images.Count);
            
            foreach (var image in createDto.Images)
            {
                if (image.Length > 0)
                {
                    try
                    {
                        var imageUrl = await _imageUploadService.UploadImageAsync(image);
                        await _imageUploadService.SaveImageToDatabaseAsync(createdActivity.Id, imageUrl);
                        _logger.LogInformation("Image uploaded successfully: {ImageUrl}", imageUrl);
                    }
                    catch (Exception imageEx)
                    {
                        _logger.LogError(imageEx, "Error uploading image");
                       
                    }
                }
            }
        }

      
        var result = new
        {
            createdActivity.Id,
            createdActivity.Name,
            createdActivity.Description,
            createdActivity.Price,
            createdActivity.AvailableSlots,
            createdActivity.Location,
            createdActivity.CategoryId,
            Category = createdActivity.Category?.Name ?? "Unknown",
            Duration = createdActivity.Duration,
            Included = createdActivity.Included?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
            Requirements = createdActivity.Requirements?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
            QuickFacts = createdActivity.QuickFacts?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
            
            StartDate = createdActivity.StartDate,
            EndDate = createdActivity.EndDate,
            IsActive = createdActivity.IsActive,
            IsExpired = createdActivity.IsExpired,
            IsUpcoming = createdActivity.IsUpcoming,
            
            ProviderName = !string.IsNullOrEmpty(createdActivity.ProviderName) ? 
                createdActivity.ProviderName : 
                createdActivity.Provider?.FullName ?? "Unknown Provider",
            
            Status = createdActivity.Status.ToString(),
            Images = createdActivity.Images?.Select(img => img.ImageUrl).ToList() ?? new List<string>(),
            Message = "Activity created successfully"
        };
        
        _logger.LogInformation("=== CONTROLLER: Returning success response ===");
        
        return CreatedAtAction(nameof(GetActivityById), new { id = createdActivity.Id }, result);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "=== CONTROLLER ERROR: Failed to create activity ===");
        _logger.LogError("Exception details: {Message}", ex.Message);
        _logger.LogError("Inner exception: {InnerException}", ex.InnerException?.Message);
        _logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
        
        return StatusCode(500, new { 
            message = "An error occurred while creating the activity",
            error = ex.Message,
            innerError = ex.InnerException?.Message,
            stackTrace = ex.StackTrace
        });
    }
}
        [HttpPut("{id}")]
public async Task<IActionResult> UpdateActivity(Guid id, [FromBody] ActivityUpdateDto updateDto)
{
    try
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingActivity = await _activityService.GetActivityByIdAsync(id);
        if (existingActivity == null)
            return NotFound(new { message = "Activity not found" });

        existingActivity.Name = updateDto.Name ?? existingActivity.Name;
        existingActivity.Description = updateDto.Description ?? existingActivity.Description;
        existingActivity.Price = updateDto.Price ?? existingActivity.Price;
        existingActivity.AvailableSlots = updateDto.AvailableSlots ?? existingActivity.AvailableSlots;
        existingActivity.Location = updateDto.Location ?? existingActivity.Location;
        existingActivity.CategoryId = updateDto.CategoryId ?? existingActivity.CategoryId;
        existingActivity.Duration = updateDto.Duration ?? existingActivity.Duration;
        existingActivity.Included = updateDto.Included ?? existingActivity.Included;
        existingActivity.Requirements = updateDto.Requirements ?? existingActivity.Requirements;
        existingActivity.QuickFacts = updateDto.QuickFacts ?? existingActivity.QuickFacts;
        
        existingActivity.ProviderName = updateDto.ProviderName ?? existingActivity.ProviderName;
        
        if (updateDto.StartDate.HasValue)
            existingActivity.StartDate = updateDto.StartDate.Value;
        if (updateDto.EndDate.HasValue)
            existingActivity.EndDate = updateDto.EndDate.Value;
        
        if (existingActivity.EndDate < DateTime.UtcNow)
        {
            existingActivity.Status = ActivityStatus.Expired;
        }
        else if (existingActivity.StartDate <= DateTime.UtcNow && existingActivity.EndDate >= DateTime.UtcNow)
        {
            existingActivity.Status = ActivityStatus.Active;
        }

        existingActivity.UpdatedAt = DateTime.UtcNow;

        var updatedActivity = await _activityService.UpdateActivityAsync(existingActivity);
        
        var result = new
        {
            updatedActivity.Id,
            updatedActivity.Name,
            updatedActivity.Description,
            updatedActivity.Price,
            updatedActivity.AvailableSlots,
            updatedActivity.Location,
            updatedActivity.CategoryId,
            Duration = updatedActivity.Duration,
            Included = updatedActivity.Included?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
            Requirements = updatedActivity.Requirements?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
            QuickFacts = updatedActivity.QuickFacts?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
           
            StartDate = updatedActivity.StartDate,
            EndDate = updatedActivity.EndDate,
            IsActive = updatedActivity.IsActive,
            IsExpired = updatedActivity.IsExpired,
            IsUpcoming = updatedActivity.IsUpcoming,
            
            Status = updatedActivity.Status.ToString()
        };
        
        return Ok(result);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error in UpdateActivity");
        return StatusCode(500, new { message = "An error occurred while updating the activity" });
    }
}
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetActivitiesByCategory(Guid categoryId)
        {
            try
            {
                var activities = await _activityService.GetActivitiesByCategoryAsync(categoryId);
                
                var result = activities.Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Description,
                    a.Price,
                    a.AvailableSlots,
                    a.Location,
                    a.CategoryId,
                    Category = a.Category?.Name ?? "Unknown",
                    ProviderName = a.Provider?.FullName ?? "Unknown Provider",
                    Duration = a.Duration ?? "4 hours",
                    Included = a.Included?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                    Requirements = a.Requirements?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                    QuickFacts = a.QuickFacts?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                   
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive,
                    IsExpired = a.IsExpired,
                    IsUpcoming = a.IsUpcoming,
                    
                    Status = a.Status.ToString(),
                    Images = a.Images?.Select(img => img.ImageUrl).ToList() ?? new List<string>()
                }).ToList();
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetActivitiesByCategory");
                return StatusCode(500, new { message = "An error occurred while retrieving activities" });
            }
        }

        [HttpGet("provider/{providerId}")]
        public async Task<IActionResult> GetActivitiesByProvider(Guid providerId)
        {
            try
            {
                var activities = await _activityService.GetActivitiesByProviderAsync(providerId);
                
                var result = activities.Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Description,
                    a.Price,
                    a.AvailableSlots,
                    a.Location,
                    a.CategoryId,
                    Category = a.Category?.Name ?? "Unknown",
                    Duration = a.Duration,
                    Included = a.Included?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                    Requirements = a.Requirements?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                    QuickFacts = a.QuickFacts?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
                    
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive,
                    IsExpired = a.IsExpired,
                    IsUpcoming = a.IsUpcoming,
                    
                    Status = a.Status.ToString(),
                    Images = a.Images?.Select(img => img.ImageUrl).ToList() ?? new List<string>()
                }).ToList();
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetActivitiesByProvider");
                return StatusCode(500, new { message = "An error occurred while retrieving activities" });
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveActivities()
        {
            try
            {
                var activities = await _activityService.GetActiveActivitiesAsync();
                
                var result = activities.Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Description,
                    a.Price,
                    a.AvailableSlots,
                    a.Location,
                    a.CategoryId,
                    Category = a.Category?.Name ?? "Unknown",
                    ProviderName = a.Provider?.FullName ?? "Unknown Provider",
                    Duration = a.Duration,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive,
                    Status = a.Status.ToString(),
                    Images = a.Images?.Select(img => img.ImageUrl).ToList() ?? new List<string>()
                }).ToList();
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetActiveActivities");
                return StatusCode(500, new { message = "An error occurred while retrieving active activities" });
            }
        }

        [HttpGet("expired")]
        public async Task<IActionResult> GetExpiredActivities()
        {
            try
            {
                var activities = await _activityService.GetExpiredActivitiesAsync();
                
                var result = activities.Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Description,
                    a.Price,
                    a.AvailableSlots,
                    a.Location,
                    a.CategoryId,
                    Category = a.Category?.Name ?? "Unknown",
                    ProviderName = a.Provider?.FullName ?? "Unknown Provider",
                    Duration = a.Duration,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsExpired = a.IsExpired,
                    Status = a.Status.ToString(),
                    Images = a.Images?.Select(img => img.ImageUrl).ToList() ?? new List<string>()
                }).ToList();
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetExpiredActivities");
                return StatusCode(500, new { message = "An error occurred while retrieving expired activities" });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateActivityStatus(Guid id, [FromBody] ActivityStatusUpdateDto statusDto)
        {
            try
            {
                _logger.LogInformation($"=== CONTROLLER: Updating status for activity {id} ===");
                
                if (statusDto == null)
                {
                    _logger.LogError("Status DTO is null");
                    return BadRequest(new { message = "Status data is required" });
                }
                
                _logger.LogInformation($"Received Status: {statusDto.Status}");
                
                var existingActivity = await _activityService.GetActivityByIdAsync(id);
                if (existingActivity == null)
                    return NotFound(new { message = "Activity not found" });

                _logger.LogInformation($"Old status: {existingActivity.Status}, New status: {statusDto.Status}");
                
                existingActivity.Status = statusDto.Status;
                existingActivity.UpdatedAt = DateTime.UtcNow;

                var updatedActivity = await _activityService.UpdateActivityAsync(existingActivity);
                
                var result = new
                {
                    updatedActivity.Id,
                    updatedActivity.Name,
                    Status = updatedActivity.Status.ToString(),
                    Message = "Status updated successfully"
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateActivityStatus");
                return StatusCode(500, new { 
                    message = "An error occurred while updating activity status", 
                    details = ex.Message 
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(Guid id)
        {
            try
            {
                await _activityService.DeleteActivityAsync(id);
                return Ok(new { message = "Activity deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteActivity");
                return StatusCode(500, new { message = "An error occurred while deleting the activity" });
            }
        }
    }

    public class UpdateActivityStatusDto
    {
        public ActivityStatus Status { get; set; }
    }
}