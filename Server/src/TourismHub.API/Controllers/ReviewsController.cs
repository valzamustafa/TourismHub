using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TourismHub.Application.Dtos.Review;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using System.Security.Claims;

namespace TourismHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly TourismHub.Application.Services.ReviewService _reviewService;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(TourismHub.Application.Services.ReviewService reviewService, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }
        [HttpGet("activity/{activityId}")]
        public async Task<IActionResult> GetActivityReviews(Guid activityId)
        {
            try
            {
                var reviews = await _reviewService.GetActivityReviewsAsync(activityId);
                var reviewDtos = reviews.Select(r => new ReviewViewDto
                {
                    Id = r.Id,
                    ActivityId = r.ActivityId,
                    UserName = r.User?.FullName ?? "Anonymous User",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList();

                return Ok(new { success = true, data = reviewDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching reviews for activity {ActivityId}", activityId);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserReviews(Guid userId)
        {
            try
            {
                var reviews = await _reviewService.GetUserReviewsAsync(userId);
                var reviewDtos = reviews.Select(r => new ReviewViewDto
                {
                    Id = r.Id,
                    ActivityId = r.ActivityId,
                    UserName = r.User?.FullName ?? "Anonymous User",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList();

                return Ok(new { success = true, data = reviewDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching reviews for user {UserId}", userId);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpGet("activity/{activityId}/average")]
        public async Task<IActionResult> GetAverageRating(Guid activityId)
        {
            try
            {
                var averageRating = await _reviewService.GetActivityAverageRatingAsync(activityId);
                return Ok(new { success = true, averageRating });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching average rating for activity {ActivityId}", activityId);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] ReviewCreateDto createDto)
        {
            try
            {
                var review = new Review
                {
                    Id = Guid.NewGuid(),
                    ActivityId = createDto.ActivityId,
                    UserId = createDto.UserId,
                    Rating = createDto.Rating,
                    Comment = createDto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                await _reviewService.CreateReviewAsync(review);

                return Ok(new { 
                    success = true, 
                    message = "Review created successfully",
                    reviewId = review.Id
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(Guid id, [FromBody] ReviewUpdateDto updateDto)
        {
            try
            {
                var review = await _reviewService.GetReviewByIdAsync(id);
                if (review == null)
                {
                    return NotFound(new { success = false, message = "Review not found" });
                }
                var currentUserId = GetCurrentUserId();
                if (review.UserId.ToString() != currentUserId && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                review.Rating = updateDto.Rating;
                review.Comment = updateDto.Comment;

                await _reviewService.UpdateReviewAsync(review);

                return Ok(new { success = true, message = "Review updated successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review {ReviewId}", id);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(Guid id)
        {
            try
            {
                var review = await _reviewService.GetReviewByIdAsync(id);
                if (review == null)
                {
                    return NotFound(new { success = false, message = "Review not found" });
                }
                var currentUserId = GetCurrentUserId();
                if (review.UserId.ToString() != currentUserId && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                await _reviewService.DeleteReviewAsync(id);

                return Ok(new { success = true, message = "Review deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review {ReviewId}", id);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReview(Guid id)
        {
            try
            {
                var review = await _reviewService.GetReviewByIdAsync(id);
                if (review == null)
                {
                    return NotFound(new { success = false, message = "Review not found" });
                }

                var reviewDto = new ReviewViewDto
                {
                    Id = review.Id,
                    ActivityId = review.ActivityId,
                    UserName = review.User?.FullName ?? "Anonymous User",
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                };

                return Ok(new { success = true, data = reviewDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching review {ReviewId}", id);
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpGet]
        [Authorize] 
        public async Task<IActionResult> GetAllReviews()
        {
            try
            {
                var reviews = await _reviewService.GetAllReviewsAsync();
                var reviewDtos = reviews.Select(r => new ReviewViewDto
                {
                    Id = r.Id,
                    ActivityId = r.ActivityId,
                    UserName = r.User?.FullName ?? "Anonymous User",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList();

                return Ok(new { success = true, data = reviewDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all reviews");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllReviewsAdmin()
        {
            try
            {
                var reviews = await _reviewService.GetAllReviewsAsync();
                var reviewDtos = reviews.Select(r => new ReviewViewDto
                {
                    Id = r.Id,
                    ActivityId = r.ActivityId,
                    UserName = r.User?.FullName ?? "Anonymous User",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList();

                return Ok(new { success = true, data = reviewDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all reviews for admin");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicReviews()
        {
            try
            {
                var reviews = await _reviewService.GetAllReviewsAsync();
                var reviewDtos = reviews.Select(r => new ReviewViewDto
                {
                    Id = r.Id,
                    ActivityId = r.ActivityId,
                    UserName = "User", 
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList();

                return Ok(new { success = true, data = reviewDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching public reviews");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpGet("all")]
        [Authorize] 
        public async Task<IActionResult> GetAllReviewsForUsers()
        {
            try
            {
                var reviews = await _reviewService.GetAllReviewsAsync();
                var reviewDtos = reviews.Select(r => new ReviewViewDto
                {
                    Id = r.Id,
                    ActivityId = r.ActivityId,
                    UserName = r.User?.FullName ?? "Anonymous User",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                }).ToList();

                return Ok(new { success = true, data = reviewDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all reviews for users");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }

        private string GetCurrentUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userId ?? string.Empty;
        }
    }
}