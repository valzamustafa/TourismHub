using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Dtos.Payment;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly PaymentService _paymentService;
        private readonly BookingService _bookingService;

        public PaymentsController(PaymentService paymentService, BookingService bookingService)
        {
            _paymentService = paymentService;
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPayments([FromQuery] PaymentStatus? status = null)
        {
            try
            {
                List<Payment> payments;

                if (status.HasValue)
                {
                    payments = await _paymentService.GetPaymentsByStatusAsync(status.Value);
                }
                else
                {
                    payments = await _paymentService.GetAllPaymentsAsync();
                }

                var response = payments.Select(payment => new PaymentViewDto
                {
                    Id = payment.Id,
                    BookingId = payment.BookingId,
                    UserFullName = payment.Booking?.User?.FullName ?? "Unknown User",
                    ActivityName = payment.Booking?.Activity?.Name ?? "Unknown Activity",
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentStatus = payment.PaymentStatus,
                    TransactionId = payment.TransactionId,
                    CreatedAt = payment.CreatedAt,
                    BookingStatus = payment.Booking?.Status ?? BookingStatus.Pending
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving payments", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentById(Guid id)
        {
            try
            {
                var payment = await _paymentService.GetPaymentByIdAsync(id);
                
                if (payment == null)
                {
                    return NotFound(new { message = $"Payment with ID {id} not found" });
                }

                var response = new PaymentViewDto
                {
                    Id = payment.Id,
                    BookingId = payment.BookingId,
                    UserFullName = payment.Booking?.User?.FullName ?? "Unknown User",
                    ActivityName = payment.Booking?.Activity?.Name ?? "Unknown Activity",
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentStatus = payment.PaymentStatus,
                    TransactionId = payment.TransactionId,
                    CreatedAt = payment.CreatedAt,
                    BookingStatus = payment.Booking?.Status ?? BookingStatus.Pending
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the payment", error = ex.Message });
            }
        }

        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetPaymentByBookingId(Guid bookingId)
        {
            try
            {
                var payment = await _paymentService.GetPaymentByBookingIdAsync(bookingId);
                
                if (payment == null)
                {
                    return NotFound(new { message = $"Payment for booking ID {bookingId} not found" });
                }

                var response = new PaymentViewDto
                {
                    Id = payment.Id,
                    BookingId = payment.BookingId,
                    UserFullName = payment.Booking?.User?.FullName ?? "Unknown User",
                    ActivityName = payment.Booking?.Activity?.Name ?? "Unknown Activity",
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentStatus = payment.PaymentStatus,
                    TransactionId = payment.TransactionId,
                    CreatedAt = payment.CreatedAt,
                    BookingStatus = payment.Booking?.Status ?? BookingStatus.Pending
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the payment", error = ex.Message });
            }
        }

        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetPaymentsByStatus(PaymentStatus status)
        {
            try
            {
                var payments = await _paymentService.GetPaymentsByStatusAsync(status);
                
                var response = payments.Select(payment => new PaymentViewDto
                {
                    Id = payment.Id,
                    BookingId = payment.BookingId,
                    UserFullName = payment.Booking?.User?.FullName ?? "Unknown User",
                    ActivityName = payment.Booking?.Activity?.Name ?? "Unknown Activity",
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentStatus = payment.PaymentStatus,
                    TransactionId = payment.TransactionId,
                    CreatedAt = payment.CreatedAt,
                    BookingStatus = payment.Booking?.Status ?? BookingStatus.Pending
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving payments", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var booking = await _bookingService.GetBookingByIdAsync(createDto.BookingId);
                if (booking == null)
                {
                    return NotFound(new { message = $"Booking with ID {createDto.BookingId} not found" });
                }

                var existingPayment = await _paymentService.GetPaymentByBookingIdAsync(createDto.BookingId);
                if (existingPayment != null)
                {
                    return Conflict(new { message = "Payment already exists for this booking" });
                }

                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    BookingId = createDto.BookingId,
                    Amount = createDto.Amount,
                    PaymentMethod = createDto.PaymentMethod,
                    PaymentStatus = PaymentStatus.Pending,
                    TransactionId = createDto.TransactionId,
                    CreatedAt = DateTime.UtcNow
                };

                var createdPayment = await _paymentService.CreatePaymentAsync(payment);

                var paymentWithDetails = await _paymentService.GetPaymentByIdAsync(createdPayment.Id);

                var response = new PaymentViewDto
                {
                    Id = paymentWithDetails!.Id,
                    BookingId = paymentWithDetails.BookingId,
                    UserFullName = paymentWithDetails.Booking?.User?.FullName ?? "Unknown User",
                    ActivityName = paymentWithDetails.Booking?.Activity?.Name ?? "Unknown Activity",
                    Amount = paymentWithDetails.Amount,
                    PaymentMethod = paymentWithDetails.PaymentMethod,
                    PaymentStatus = paymentWithDetails.PaymentStatus,
                    TransactionId = paymentWithDetails.TransactionId,
                    CreatedAt = paymentWithDetails.CreatedAt,
                    BookingStatus = paymentWithDetails.Booking?.Status ?? BookingStatus.Pending
                };

                return CreatedAtAction(nameof(GetPaymentById), new { id = response.Id }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the payment", error = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdatePaymentStatus(Guid id, [FromBody] PaymentStatusUpdateDto statusDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var payment = await _paymentService.GetPaymentByIdAsync(id);
                if (payment == null)
                {
                    return NotFound(new { message = $"Payment with ID {id} not found" });
                }

                payment.PaymentStatus = statusDto.PaymentStatus;
                
                if (!string.IsNullOrEmpty(statusDto.TransactionId))
                {
                    payment.TransactionId = statusDto.TransactionId;
                }

                await _paymentService.UpdatePaymentAsync(payment);

                var updatedPayment = await _paymentService.GetPaymentByIdAsync(id);

                var response = new PaymentViewDto
                {
                    Id = updatedPayment!.Id,
                    BookingId = updatedPayment.BookingId,
                    UserFullName = updatedPayment.Booking?.User?.FullName ?? "Unknown User",
                    ActivityName = updatedPayment.Booking?.Activity?.Name ?? "Unknown Activity",
                    Amount = updatedPayment.Amount,
                    PaymentMethod = updatedPayment.PaymentMethod,
                    PaymentStatus = updatedPayment.PaymentStatus,
                    TransactionId = updatedPayment.TransactionId,
                    CreatedAt = updatedPayment.CreatedAt,
                    BookingStatus = updatedPayment.Booking?.Status ?? BookingStatus.Pending
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the payment status", error = ex.Message });
            }
        }

        [HttpPost("{id}/process")]
        public async Task<IActionResult> ProcessPayment(Guid id, [FromBody] PaymentProcessDto processDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await _paymentService.ProcessPaymentAsync(id, processDto.TransactionId);

                var processedPayment = await _paymentService.GetPaymentByIdAsync(id);

                var response = new PaymentViewDto
                {
                    Id = processedPayment!.Id,
                    BookingId = processedPayment.BookingId,
                    UserFullName = processedPayment.Booking?.User?.FullName ?? "Unknown User",
                    ActivityName = processedPayment.Booking?.Activity?.Name ?? "Unknown Activity",
                    Amount = processedPayment.Amount,
                    PaymentMethod = processedPayment.PaymentMethod,
                    PaymentStatus = processedPayment.PaymentStatus,
                    TransactionId = processedPayment.TransactionId,
                    CreatedAt = processedPayment.CreatedAt,
                    BookingStatus = processedPayment.Booking?.Status ?? BookingStatus.Pending
                };

                return Ok(new { 
                    message = "Payment processed successfully", 
                    payment = response 
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing the payment", error = ex.Message });
            }
        }

        [HttpPost("{id}/fail")]
        public async Task<IActionResult> FailPayment(Guid id)
        {
            try
            {
                await _paymentService.FailPaymentAsync(id);

                var failedPayment = await _paymentService.GetPaymentByIdAsync(id);

                var response = new PaymentViewDto
                {
                    Id = failedPayment!.Id,
                    BookingId = failedPayment.BookingId,
                    UserFullName = failedPayment.Booking?.User?.FullName ?? "Unknown User",
                    ActivityName = failedPayment.Booking?.Activity?.Name ?? "Unknown Activity",
                    Amount = failedPayment.Amount,
                    PaymentMethod = failedPayment.PaymentMethod,
                    PaymentStatus = failedPayment.PaymentStatus,
                    TransactionId = failedPayment.TransactionId,
                    CreatedAt = failedPayment.CreatedAt,
                    BookingStatus = failedPayment.Booking?.Status ?? BookingStatus.Pending
                };

                return Ok(new { 
                    message = "Payment marked as failed", 
                    payment = response 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while failing the payment", error = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetPaymentStats()
        {
            try
            {
                var allPayments = await _paymentService.GetAllPaymentsAsync();
                
                var stats = new
                {
                    TotalPayments = allPayments.Count,
                    TotalRevenue = allPayments.Where(p => p.PaymentStatus == PaymentStatus.Paid).Sum(p => p.Amount),
                    PendingPayments = allPayments.Count(p => p.PaymentStatus == PaymentStatus.Pending),
                    SuccessfulPayments = allPayments.Count(p => p.PaymentStatus == PaymentStatus.Paid),
                    FailedPayments = allPayments.Count(p => p.PaymentStatus == PaymentStatus.Failed),
                    AveragePaymentAmount = allPayments.Where(p => p.PaymentStatus == PaymentStatus.Paid).Average(p => p.Amount)
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving payment statistics", error = ex.Message });
            }
        }
    }
}