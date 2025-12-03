using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.Booking; 
using TourismHub.Domain.Enums;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly BookingService _bookingService;
    private readonly ActivityService _activityService;

    public BookingsController(BookingService bookingService, ActivityService activityService)
    {
        _bookingService = bookingService;
        _activityService = activityService;
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetBookingsByUserId(Guid userId)
    {
        try
        {
            var bookings = await _bookingService.GetBookingsByUserIdAsync(userId);
            
            if (bookings == null || !bookings.Any())
            {
                return Ok(new List<object>());
            }

            var response = bookings.Select(booking => new
            {
                Id = booking.Id,
                ActivityId = booking.ActivityId,
                ActivityName = booking.Activity?.Name ?? "Unknown Activity",
                ActivityImage = booking.Activity?.Images?.FirstOrDefault(),
                BookingDate = booking.BookingDate,
                SelectedDate = booking.BookingDate,
                NumberOfPeople = booking.NumberOfPeople,
                TotalAmount = booking.TotalPrice > 0 ? booking.TotalPrice : ((booking.Activity?.Price ?? 0) * booking.NumberOfPeople),
                Status = booking.Status.ToString(),
                PaymentStatus = booking.PaymentStatus.ToString()
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                message = "An error occurred while retrieving user bookings", 
                error = ex.Message 
            });
        }
    }

    [HttpGet("provider/{providerId}")]
    public async Task<IActionResult> GetBookingsByProvider(Guid providerId)
    {
        try
        {
            var providerActivities = await _activityService.GetActivitiesByProviderAsync(providerId);
            var activityIds = providerActivities.Select(a => a.Id).ToList();

            var allBookings = await _bookingService.GetAllBookingsWithDetailsAsync();
        
            var providerBookings = allBookings
                .Where(b => activityIds.Contains(b.ActivityId))
                .ToList();

            var response = providerBookings.Select(booking => new
            {
                Id = booking.Id,
                ActivityName = booking.Activity?.Name ?? "Unknown Activity",
                UserName = booking.User?.FullName ?? "Unknown User",
                BookingDate = booking.BookingDate,
                NumberOfPeople = booking.NumberOfPeople,
                TotalAmount = (booking.Activity?.Price ?? 0) * booking.NumberOfPeople,
                Status = booking.Status.ToString(),
                PaymentStatus = booking.PaymentStatus.ToString()
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving provider bookings", error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBookings()
    {
        try
        {
            var bookings = await _bookingService.GetAllBookingsWithDetailsAsync();
            var response = bookings.Select(booking => new
            {
                Id = booking.Id,
                ActivityName = booking.Activity?.Name ?? "Unknown Activity",
                UserName = booking.User?.FullName ?? "Unknown User",
                BookingDate = booking.BookingDate,
                NumberOfPeople = booking.NumberOfPeople,
                TotalAmount = (booking.Activity?.Price ?? 0) * booking.NumberOfPeople,
                Status = booking.Status.ToString()
            });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving bookings", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] BookingCreateDto createDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                UserId = createDto.UserId,
                ActivityId = createDto.ActivityId,
                BookingDate = createDto.BookingDate,
                NumberOfPeople = createDto.NumberOfPeople,
                Status = BookingStatus.Pending, 
                PaymentStatus = PaymentStatus.Pending, 
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdBooking = await _bookingService.CreateBookingAsync(booking);
            return Ok(new { message = "Booking created successfully", bookingId = createdBooking.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the booking", error = ex.Message });
        }
    }


    [HttpPut("{bookingId}/cancel")]
    public async Task<IActionResult> CancelBooking(Guid bookingId)
    {
        try
        {
            var result = await _bookingService.CancelBookingAsync(bookingId);
            
            if (!result)
            {
                return NotFound(new { message = "Booking not found or cannot be cancelled" });
            }

            return Ok(new { message = "Booking cancelled successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                message = "An error occurred while cancelling the booking", 
                error = ex.Message 
            });
        }
    }
}

public class BookingCreateDto
{
    public Guid UserId { get; set; }
    public Guid ActivityId { get; set; }
    public DateTime BookingDate { get; set; }
    public int NumberOfPeople { get; set; }
}