using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Dtos.Booking;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _bookingService;

        public BookingsController(BookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBookings(
            [FromQuery] Guid? userId = null, 
            [FromQuery] BookingStatus? status = null)
        {
            try
            {
                List<Booking> bookings;

                if (userId.HasValue && status.HasValue)
                {
                    var userBookings = await _bookingService.GetUserBookingsAsync(userId.Value);
                    bookings = userBookings.Where(b => b.Status == status.Value).ToList();
                }
                else if (userId.HasValue)
                {
                    bookings = await _bookingService.GetUserBookingsAsync(userId.Value);
                }
                else if (status.HasValue)
                {
                    bookings = await _bookingService.GetBookingsByStatusAsync(status.Value);
                }
                else
                {
                    bookings = await _bookingService.GetAllBookingsAsync();
                }

                var response = bookings.Select(booking => new BookingViewDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    UserFullName = booking.User?.FullName ?? "Unknown User",
                    ActivityId = booking.ActivityId,
                    ActivityName = booking.Activity?.Name ?? "Unknown Activity",
                    ActivityPrice = booking.Activity?.Price ?? 0,
                    BookingDate = booking.BookingDate,
                    NumberOfPeople = booking.NumberOfPeople,
                    TotalAmount = (booking.Activity?.Price ?? 0) * booking.NumberOfPeople,
                    Status = booking.Status,
                    PaymentStatus = booking.PaymentStatus,
                    CreatedAt = booking.CreatedAt,
                    UpdatedAt = booking.UpdatedAt
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving bookings", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBookingById(Guid id)
        {
            try
            {
                var booking = await _bookingService.GetBookingByIdAsync(id);
                
                if (booking == null)
                {
                    return NotFound(new { message = $"Booking with ID {id} not found" });
                }

                var response = new BookingViewDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    UserFullName = booking.User?.FullName ?? "Unknown User",
                    ActivityId = booking.ActivityId,
                    ActivityName = booking.Activity?.Name ?? "Unknown Activity",
                    ActivityPrice = booking.Activity?.Price ?? 0,
                    BookingDate = booking.BookingDate,
                    NumberOfPeople = booking.NumberOfPeople,
                    TotalAmount = (booking.Activity?.Price ?? 0) * booking.NumberOfPeople,
                    Status = booking.Status,
                    PaymentStatus = booking.PaymentStatus,
                    CreatedAt = booking.CreatedAt,
                    UpdatedAt = booking.UpdatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the booking", error = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserBookings(Guid userId)
        {
            try
            {
                var bookings = await _bookingService.GetUserBookingsAsync(userId);
                
                var response = bookings.Select(booking => new BookingViewDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    UserFullName = booking.User?.FullName ?? "Unknown User",
                    ActivityId = booking.ActivityId,
                    ActivityName = booking.Activity?.Name ?? "Unknown Activity",
                    ActivityPrice = booking.Activity?.Price ?? 0,
                    BookingDate = booking.BookingDate,
                    NumberOfPeople = booking.NumberOfPeople,
                    TotalAmount = (booking.Activity?.Price ?? 0) * booking.NumberOfPeople,
                    Status = booking.Status,
                    PaymentStatus = booking.PaymentStatus,
                    CreatedAt = booking.CreatedAt,
                    UpdatedAt = booking.UpdatedAt
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving user bookings", error = ex.Message });
            }
        }

        [HttpGet("activity/{activityId}")]
        public async Task<IActionResult> GetActivityBookings(Guid activityId)
        {
            try
            {
                var bookings = await _bookingService.GetActivityBookingsAsync(activityId);
                
                var response = bookings.Select(booking => new BookingViewDto
                {
                    Id = booking.Id,
                    UserId = booking.UserId,
                    UserFullName = booking.User?.FullName ?? "Unknown User",
                    ActivityId = booking.ActivityId,
                    ActivityName = booking.Activity?.Name ?? "Unknown Activity",
                    ActivityPrice = booking.Activity?.Price ?? 0,
                    BookingDate = booking.BookingDate,
                    NumberOfPeople = booking.NumberOfPeople,
                    TotalAmount = (booking.Activity?.Price ?? 0) * booking.NumberOfPeople,
                    Status = booking.Status,
                    PaymentStatus = booking.PaymentStatus,
                    CreatedAt = booking.CreatedAt,
                    UpdatedAt = booking.UpdatedAt
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving activity bookings", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

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

                var bookingWithDetails = await _bookingService.GetBookingByIdAsync(createdBooking.Id);

                var response = new BookingViewDto
                {
                    Id = bookingWithDetails!.Id,
                    UserId = bookingWithDetails.UserId,
                    UserFullName = bookingWithDetails.User?.FullName ?? "Unknown User",
                    ActivityId = bookingWithDetails.ActivityId,
                    ActivityName = bookingWithDetails.Activity?.Name ?? "Unknown Activity",
                    ActivityPrice = bookingWithDetails.Activity?.Price ?? 0,
                    BookingDate = bookingWithDetails.BookingDate,
                    NumberOfPeople = bookingWithDetails.NumberOfPeople,
                    TotalAmount = (bookingWithDetails.Activity?.Price ?? 0) * bookingWithDetails.NumberOfPeople,
                    Status = bookingWithDetails.Status,
                    PaymentStatus = bookingWithDetails.PaymentStatus,
                    CreatedAt = bookingWithDetails.CreatedAt,
                    UpdatedAt = bookingWithDetails.UpdatedAt
                };

                return CreatedAtAction(nameof(GetBookingById), new { id = response.Id }, response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the booking", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(Guid id, [FromBody] BookingUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingBooking = await _bookingService.GetBookingByIdAsync(id);
                if (existingBooking == null)
                {
                    return NotFound(new { message = $"Booking with ID {id} not found" });
                }

                existingBooking.BookingDate = updateDto.BookingDate;
                existingBooking.NumberOfPeople = updateDto.NumberOfPeople;
                existingBooking.UpdatedAt = DateTime.UtcNow;

                await _bookingService.UpdateBookingAsync(existingBooking);

                var updatedBooking = await _bookingService.GetBookingByIdAsync(id);

                var response = new BookingViewDto
                {
                    Id = updatedBooking!.Id,
                    UserId = updatedBooking.UserId,
                    UserFullName = updatedBooking.User?.FullName ?? "Unknown User",
                    ActivityId = updatedBooking.ActivityId,
                    ActivityName = updatedBooking.Activity?.Name ?? "Unknown Activity",
                    ActivityPrice = updatedBooking.Activity?.Price ?? 0,
                    BookingDate = updatedBooking.BookingDate,
                    NumberOfPeople = updatedBooking.NumberOfPeople,
                    TotalAmount = (updatedBooking.Activity?.Price ?? 0) * updatedBooking.NumberOfPeople,
                    Status = updatedBooking.Status,
                    PaymentStatus = updatedBooking.PaymentStatus,
                    CreatedAt = updatedBooking.CreatedAt,
                    UpdatedAt = updatedBooking.UpdatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the booking", error = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] BookingStatusUpdateDto statusDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await _bookingService.UpdateBookingStatusAsync(id, statusDto.Status);

                var updatedBooking = await _bookingService.GetBookingByIdAsync(id);

                var response = new BookingViewDto
                {
                    Id = updatedBooking!.Id,
                    UserId = updatedBooking.UserId,
                    UserFullName = updatedBooking.User?.FullName ?? "Unknown User",
                    ActivityId = updatedBooking.ActivityId,
                    ActivityName = updatedBooking.Activity?.Name ?? "Unknown Activity",
                    ActivityPrice = updatedBooking.Activity?.Price ?? 0,
                    BookingDate = updatedBooking.BookingDate,
                    NumberOfPeople = updatedBooking.NumberOfPeople,
                    TotalAmount = (updatedBooking.Activity?.Price ?? 0) * updatedBooking.NumberOfPeople,
                    Status = updatedBooking.Status,
                    PaymentStatus = updatedBooking.PaymentStatus,
                    CreatedAt = updatedBooking.CreatedAt,
                    UpdatedAt = updatedBooking.UpdatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the booking status", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(Guid id)
        {
            try
            {
                var existingBooking = await _bookingService.GetBookingByIdAsync(id);
                if (existingBooking == null)
                {
                    return NotFound(new { message = $"Booking with ID {id} not found" });
                }

                await _bookingService.DeleteBookingAsync(id);

                return Ok(new { message = "Booking deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the booking", error = ex.Message });
            }
        }
    }
}