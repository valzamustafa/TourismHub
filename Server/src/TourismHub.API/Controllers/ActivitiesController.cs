using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.Activity;
using TourismHub.Domain.Enums;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivitiesController : ControllerBase
    {
        private readonly ActivityService _activityService;
        private readonly ILogger<ActivitiesController> _logger;

        public ActivitiesController(ActivityService activityService, ILogger<ActivitiesController> logger)
        {
            _activityService = activityService;
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
                    Duration = "4 hours",
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

                return Ok(activity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetActivityById");
                return StatusCode(500, new { message = "An error occurred while retrieving the activity" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateActivity([FromBody] ActivityCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var activity = new Activity
                {
                    Id = Guid.NewGuid(),
                    ProviderId = createDto.ProviderId,
                    Name = createDto.Name,
                    Description = createDto.Description,
                    Price = createDto.Price,
                    AvailableSlots = createDto.AvailableSlots,
                    Location = createDto.Location,
                    CategoryId = createDto.CategoryId,
                    Status = ActivityStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdActivity = await _activityService.CreateActivityAsync(activity);
                
                var result = new
                {
                    createdActivity.Id,
                    createdActivity.Name,
                    createdActivity.Description,
                    createdActivity.Price,
                    createdActivity.AvailableSlots,
                    createdActivity.Location,
                    createdActivity.CategoryId,
                    Status = createdActivity.Status.ToString()
                };
                
                return CreatedAtAction(nameof(GetActivityById), new { id = createdActivity.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateActivity");
                return StatusCode(500, new { message = "An error occurred while creating the activity" });
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
                    Duration = "4 hours",
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
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetActivitiesByProvider");
                return StatusCode(500, new { message = "An error occurred while retrieving activities" });
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
}