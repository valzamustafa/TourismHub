// API/Controllers/SavedActivitiesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TourismHub.API.Hubs;
using TourismHub.Application.Services;
using TourismHub.Application.Interfaces.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
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
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ActivityService _activityService;

        public SavedActivitiesController(
            ISavedActivityService savedActivityService,
            ILogger<SavedActivitiesController> logger,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubContext,
            ActivityService activityService)
        {
            _savedActivityService = savedActivityService;
            _logger = logger;
            _notificationService = notificationService;
            _hubContext = hubContext;
            _activityService = activityService;
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
       
                var activity = await _activityService.GetActivityByIdAsync(activityId);
                if (activity != null)
                {
       
                    await _notificationService.SendRealTimeNotification(
                        _hubContext,
                        userId,
                        "Activity Saved",
                        $"You saved '{activity.Name}' to your favorites.",
                        NotificationType.Activity,
                        activityId
                    );

                    if (activity.ProviderId.HasValue)
                    {
                        await _notificationService.SendRealTimeNotification(
                            _hubContext,
                            activity.ProviderId.Value,
                            "Activity Saved",
                            $"Someone saved your activity '{activity.Name}' to their favorites.",
                            NotificationType.Activity,
                            activityId
                        );
                    }
                }

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

             
                var activity = await _activityService.GetActivityByIdAsync(activityId);
                if (activity != null)
                {
              
                    await _notificationService.SendRealTimeNotification(
                        _hubContext,
                        userId,
                        "Activity Removed",
                        $"You removed '{activity.Name}' from your favorites.",
                        NotificationType.Activity,
                        activityId
                    );
                }

                return Ok(new { message = "Activity unsaved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unsaving activity {ActivityId} for user {UserId}", activityId, userId);
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("recently-saved/{userId}")]
        public async Task<IActionResult> GetRecentlySavedActivities(Guid userId, [FromQuery] int count = 5)
        {
            try
            {
                var savedActivities = await _savedActivityService.GetRecentlySavedActivitiesAsync(userId, count);
                return Ok(savedActivities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recently saved activities for user {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        [HttpGet("count/{userId}")]
        public async Task<IActionResult> GetSavedActivitiesCount(Guid userId)
        {
            try
            {
                var count = await _savedActivityService.GetSavedActivitiesCountAsync(userId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting saved activities count for user {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}