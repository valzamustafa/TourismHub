using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TourismHub.API.Hubs;
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
    private readonly INotificationService _notificationService;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly UserService _userService;

    public BookingsController(
        BookingService bookingService, 
        ActivityService activityService,
        INotificationService notificationService,
        IHubContext<NotificationHub> hubContext,
        UserService userService)
    {
        _bookingService = bookingService;
        _activityService = activityService;
        _notificationService = notificationService;
        _hubContext = hubContext;
        _userService = userService;
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
            
        
            await _notificationService.SendRealTimeNotification(
                _hubContext,
                createDto.UserId,
                "Booking Confirmed",
                $"Your booking for {createdBooking.BookingDate.ToShortDateString()} has been created successfully.",
                NotificationType.Booking,
                createdBooking.Id
            );


            var activity = await _activityService.GetActivityByIdAsync(createDto.ActivityId);
            if (activity?.ProviderId != null)
            {
                await _notificationService.SendRealTimeNotification(
                    _hubContext,
                    activity.ProviderId.Value,
                    "New Booking",
                    $"You have a new booking for '{activity.Name}' on {createdBooking.BookingDate.ToShortDateString()}.",
                    NotificationType.Booking,
                    createdBooking.Id
                );
            }

            var admins = await _userService.GetUsersByRoleAsync(UserRole.Admin);
            foreach (var admin in admins)
            {
                await _notificationService.SendRealTimeNotification(
                    _hubContext,
                    admin.Id,
                    "New Booking Created",
                    $"New booking created by user for activity '{activity?.Name ?? "Unknown"}'.",
                    NotificationType.Booking,
                    createdBooking.Id
                );
            }

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

            var booking = await _bookingService.GetBookingByIdAsync(bookingId);
            if (booking != null)
            {
                await _notificationService.SendRealTimeNotification(
                    _hubContext,
                    booking.UserId,
                    "Booking Cancelled",
                    $"Your booking has been cancelled successfully.",
                    NotificationType.Booking,
                    bookingId
                );

                var activity = await _activityService.GetActivityByIdAsync(booking.ActivityId);
                if (activity?.ProviderId != null)
                {
                    await _notificationService.SendRealTimeNotification(
                        _hubContext,
                        activity.ProviderId.Value,
                        "Booking Cancelled",
                        $"Booking #{bookingId} has been cancelled by the user.",
                        NotificationType.Booking,
                        bookingId
                    );
                }
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