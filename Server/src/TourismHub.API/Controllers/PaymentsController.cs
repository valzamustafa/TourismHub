// Controllers/PaymentsController.cs
using Microsoft.AspNetCore.Mvc;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private static readonly List<Payment> _payments = new();

    [HttpGet]
    public IActionResult GetPayments([FromQuery] PaymentStatus? status = null)
    {
        var payments = _payments;
        if (status.HasValue)
            payments = payments.Where(p => p.PaymentStatus == status.Value).ToList();
        
        return Ok(payments);
    }

    [HttpGet("{id}")]
    public IActionResult GetPayment(Guid id)
    {
        var payment = _payments.FirstOrDefault(p => p.Id == id);
        if (payment == null) return NotFound();
        return Ok(payment);
    }

    [HttpPost]
    public IActionResult CreatePayment([FromBody] PaymentCreateDto dto)
    {
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            BookingId = dto.BookingId,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = PaymentStatus.Pending,
            TransactionId = dto.TransactionId,
            CreatedAt = DateTime.UtcNow
        };
        
        _payments.Add(payment);
        return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
    }

    [HttpPut("{id}/status")]
    public IActionResult UpdatePaymentStatus(Guid id, [FromBody] PaymentStatusUpdateDto dto)
    {
        var payment = _payments.FirstOrDefault(p => p.Id == id);
        if (payment == null) return NotFound();
        
        payment.PaymentStatus = dto.PaymentStatus;
        
        return Ok(payment);
    }
}

public record PaymentCreateDto(
    Guid BookingId,
    decimal Amount,
    PaymentMethod PaymentMethod,
    string? TransactionId = null
);

public record PaymentStatusUpdateDto(PaymentStatus PaymentStatus);