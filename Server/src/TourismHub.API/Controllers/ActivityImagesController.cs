using Microsoft.AspNetCore.Mvc;
using TourismHub.Domain.Entities;

[ApiController]
[Route("api/[controller]")]
public class ActivityImagesController : ControllerBase
{
    private static readonly List<ActivityImage> _images = new();

    [HttpGet]
    public IActionResult GetImages([FromQuery] Guid activityId)
    {
        var images = _images.Where(img => img.ActivityId == activityId).ToList();
        return Ok(images);
    }

    [HttpPost]
    public IActionResult UploadImage([FromBody] ActivityImageCreateDto dto)
    {
        var image = new ActivityImage
        {
            Id = Guid.NewGuid(),
            ActivityId = dto.ActivityId,
            ImageUrl = dto.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };
        
        _images.Add(image);
        return CreatedAtAction(nameof(GetImages), new { activityId = image.ActivityId }, image);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteImage(Guid id)
    {
        var image = _images.FirstOrDefault(img => img.Id == id);
        if (image == null) return NotFound();
        
        _images.Remove(image);
        return NoContent();
    }
}

public record ActivityImageCreateDto(
    Guid ActivityId,
    string ImageUrl
);