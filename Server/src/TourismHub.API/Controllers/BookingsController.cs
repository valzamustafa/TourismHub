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
}