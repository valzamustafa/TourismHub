// API/Controllers/SavedActivitiesController.cs
using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SavedActivitiesController : ControllerBase
    {
        private readonly ISavedActivityService _savedActivityService;
        private readonly ILogger<SavedActivitiesController> _logger;

        public SavedActivitiesController(
            ISavedActivityService savedActivityService,
            ILogger<SavedActivitiesController> logger)
        {
            _savedActivityService = savedActivityService;
            _logger = logger;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserSavedActivities(Guid userId)
        {
            try
            {
                var savedActivities = await _savedActivityService.GetUserSavedActivitiesAsync(userId);
                return Ok(savedActivities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting saved activities for user {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("check/{userId}/{activityId}")]
        public async Task<IActionResult> CheckIfSaved(Guid userId, Guid activityId)
        {
            try
            {
                var isSaved = await _savedActivityService.IsActivitySavedAsync(userId, activityId);
                return Ok(new { isSaved });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if activity is saved");
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpPost("save/{userId}/{activityId}")]
        public async Task<IActionResult> SaveActivity(Guid userId, Guid activityId)
        {
            try
            {
                var savedActivity = await _savedActivityService.SaveActivityAsync(userId, activityId);
                return Ok(savedActivity);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving activity {ActivityId} for user {UserId}", activityId, userId);
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpDelete("unsave/{userId}/{activityId}")]
        public async Task<IActionResult> UnsaveActivity(Guid userId, Guid activityId)
        {
            try
            {
                var result = await _savedActivityService.UnsaveActivityAsync(userId, activityId);
                if (!result)
                    return NotFound(new { message = "Saved activity not found" });

                return Ok(new { message = "Activity unsaved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unsaving activity {ActivityId} for user {UserId}", activityId, userId);
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}