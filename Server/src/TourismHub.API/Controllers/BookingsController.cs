// Controllers/BookingsController.cs
using Microsoft.AspNetCore.Mvc;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private static readonly List<Booking> _bookings = new();

    [HttpGet]
    public IActionResult GetBookings([FromQuery] Guid? userId = null, [FromQuery] BookingStatus? status = null)
    {
        var bookings = _bookings.AsEnumerable();
        
        if (userId.HasValue)
            bookings = bookings.Where(b => b.UserId == userId.Value);
        
        if (status.HasValue)
            bookings = bookings.Where(b => b.Status == status.Value);
        
        return Ok(bookings.ToList());
    }

    [HttpGet("{id}")]
    public IActionResult GetBooking(Guid id)
    {
        var booking = _bookings.FirstOrDefault(b => b.Id == id);
        if (booking == null) return NotFound();
        return Ok(booking);
    }

    [HttpPost]
    public IActionResult CreateBooking([FromBody] BookingCreateDto dto)
    {
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            ActivityId = dto.ActivityId,
            BookingDate = dto.BookingDate,
            NumberOfPeople = dto.NumberOfPeople,
            Status = BookingStatus.Pending,
            PaymentStatus = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _bookings.Add(booking);
        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
    }

    [HttpPut("{id}/status")]
    public IActionResult UpdateBookingStatus(Guid id, [FromBody] BookingStatusUpdateDto dto)
    {
        var booking = _bookings.FirstOrDefault(b => b.Id == id);
        if (booking == null) return NotFound();
        
        booking.Status = dto.Status;
        booking.UpdatedAt = DateTime.UtcNow;
        
        return Ok(booking);
    }
}

public record BookingCreateDto(
    Guid UserId,
    Guid ActivityId,
    DateTime BookingDate,
    int NumberOfPeople
);

public record BookingStatusUpdateDto(BookingStatus Status);