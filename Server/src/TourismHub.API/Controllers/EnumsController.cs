// Controllers/EnumsController.cs
using Microsoft.AspNetCore.Mvc;
using TourismHub.Domain.Enums;

[ApiController]
[Route("api/[controller]")]
public class EnumsController : ControllerBase
{
    [HttpGet("user-roles")]
    public IActionResult GetUserRoles()
    {
        var roles = Enum.GetValues(typeof(UserRole))
            .Cast<UserRole>()
            .Select(r => new { Id = (int)r, Name = r.ToString() });
        
        return Ok(roles);
    }

    [HttpGet("activity-statuses")]
    public IActionResult GetActivityStatuses()
    {
        var statuses = Enum.GetValues(typeof(ActivityStatus))
            .Cast<ActivityStatus>()
            .Select(s => new { Id = (int)s, Name = s.ToString() });
        
        return Ok(statuses);
    }

    [HttpGet("booking-statuses")]
    public IActionResult GetBookingStatuses()
    {
        var statuses = Enum.GetValues(typeof(BookingStatus))
            .Cast<BookingStatus>()
            .Select(s => new { Id = (int)s, Name = s.ToString() });
        
        return Ok(statuses);
    }

    [HttpGet("payment-statuses")]
    public IActionResult GetPaymentStatuses()
    {
        var statuses = Enum.GetValues(typeof(PaymentStatus))
            .Cast<PaymentStatus>()
            .Select(s => new { Id = (int)s, Name = s.ToString() });
        
        return Ok(statuses);
    }

    [HttpGet("payment-methods")]
    public IActionResult GetPaymentMethods()
    {
        var methods = Enum.GetValues(typeof(PaymentMethod))
            .Cast<PaymentMethod>()
            .Select(m => new { Id = (int)m, Name = m.ToString() });
        
        return Ok(methods);
    }

    [HttpGet("admin-target-types")]
    public IActionResult GetAdminTargetTypes()
    {
        var types = Enum.GetValues(typeof(AdminTargetType))
            .Cast<AdminTargetType>()
            .Select(t => new { Id = (int)t, Name = t.ToString() });
        
        return Ok(types);
    }
}