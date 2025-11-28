using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services; // Add this
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.Activity;
using TourismHub.Domain.Enums; 

namespace TourismHub.API.Controllers // Add namespace
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivitiesController : ControllerBase
    {
        private readonly ActivityService _activityService;

        public ActivitiesController(ActivityService activityService)
        {
            _activityService = activityService;
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
            return StatusCode(500, new { message = "An error occurred while retrieving activities", error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllActivities()
    {
        try
        {
            var activities = await _activityService.GetAllActivitiesAsync();
            return Ok(activities);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving activities", error = ex.Message });
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
            return StatusCode(500, new { message = "An error occurred while retrieving the activity", error = ex.Message });
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
            return CreatedAtAction(nameof(GetActivityById), new { id = createdActivity.Id }, createdActivity);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the activity", error = ex.Message });
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

            existingActivity.Name = updateDto.Name;
            existingActivity.Description = updateDto.Description;
            existingActivity.Price = updateDto.Price;
            existingActivity.AvailableSlots = updateDto.AvailableSlots;
            existingActivity.Location = updateDto.Location;
            existingActivity.CategoryId = updateDto.CategoryId;
            existingActivity.UpdatedAt = DateTime.UtcNow;

            await _activityService.UpdateActivityAsync(existingActivity);
            return Ok(existingActivity);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the activity", error = ex.Message });
        }
    }
[HttpGet("category/{categoryId}")]
public async Task<IActionResult> GetActivitiesByCategory(Guid categoryId)
{
    try
    {
        var activities = await _activityService.GetActivitiesByCategoryAsync(categoryId);
        return Ok(activities);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "An error occurred while retrieving activities", error = ex.Message });
    }
}
 
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteActivity(Guid id)
    {
        try
        {
            var existingActivity = await _activityService.GetActivityByIdAsync(id);
            if (existingActivity == null)
                return NotFound(new { message = "Activity not found" });

            await _activityService.DeleteActivityAsync(id);
            return Ok(new { message = "Activity deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the activity", error = ex.Message });
        }
    }
}
}