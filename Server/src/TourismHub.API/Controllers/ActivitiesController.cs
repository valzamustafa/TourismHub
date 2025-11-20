using Microsoft.AspNetCore.Mvc;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Application.DTOs.Activity;
[ApiController]
[Route("api/[controller]")]
public class ActivitiesController : ControllerBase
{
    private static readonly List<Activity> _activities = new();

    [HttpGet]
    public IActionResult GetActivities([FromQuery] ActivityStatus? status = null)
    {
        var activities = _activities;
        if (status.HasValue)
            activities = activities.Where(a => a.Status == status.Value).ToList();
        
        return Ok(activities);
    }

    [HttpGet("{id}")]
    public IActionResult GetActivity(Guid id)
    {
        var activity = _activities.FirstOrDefault(a => a.Id == id);
        if (activity == null) return NotFound();
        return Ok(activity);
    }

    [HttpPost]
    public IActionResult CreateActivity([FromBody] ActivityCreateDto dto)
    {
        var activity = new Activity
        {
            Id = Guid.NewGuid(),
            ProviderId = dto.ProviderId,
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            AvailableSlots = dto.AvailableSlots,
            Location = dto.Location,
            Category = dto.Category,
            Status = ActivityStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _activities.Add(activity);
        return CreatedAtAction(nameof(GetActivity), new { id = activity.Id }, activity);
    }

    [HttpPut("{id}/status")]
    public IActionResult UpdateActivityStatus(Guid id, [FromBody] ActivityStatusUpdateDto dto)
    {
        var activity = _activities.FirstOrDefault(a => a.Id == id);
        if (activity == null) return NotFound();
        
        activity.Status = dto.Status;
        activity.UpdatedAt = DateTime.UtcNow;
        
        return Ok(activity);
    }
}

