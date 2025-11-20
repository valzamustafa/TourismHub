using Microsoft.AspNetCore.Mvc;
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.Review;
[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private static readonly List<Review> _reviews = new();

    [HttpGet]
    public IActionResult GetReviews([FromQuery] Guid? activityId = null, [FromQuery] Guid? userId = null)
    {
        var reviews = _reviews.AsEnumerable();

        if (activityId.HasValue)
            reviews = reviews.Where(r => r.ActivityId == activityId.Value);

        if (userId.HasValue)
            reviews = reviews.Where(r => r.UserId == userId.Value);

        return Ok(reviews.ToList());
    }

    [HttpGet("{id}")]
    public IActionResult GetReview(Guid id)
    {
        var review = _reviews.FirstOrDefault(r => r.Id == id);
        if (review == null) return NotFound();
        return Ok(review);
    }

    [HttpPost]
    public IActionResult CreateReview([FromBody] ReviewCreateDto dto)
    {
        // Validate rating range
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Rating must be between 1 and 5");

        var review = new Review
        {
            Id = Guid.NewGuid(),
            ActivityId = dto.ActivityId,
            UserId = dto.UserId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _reviews.Add(review);
        return CreatedAtAction(nameof(GetReview), new { id = review.Id }, review);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteReview(Guid id)
    {
        var review = _reviews.FirstOrDefault(r => r.Id == id);
        if (review == null) return NotFound();

        _reviews.Remove(review);
        return NoContent();
    }
}

