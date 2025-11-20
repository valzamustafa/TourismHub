using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services
{
    public class PaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;

        public PaymentService(IPaymentRepository paymentRepository, IBookingRepository bookingRepository)
        {
            _paymentRepository = paymentRepository;
            _bookingRepository = bookingRepository;
        }

        public async Task<Payment?> GetPaymentByIdAsync(Guid id)
        {
            return await _paymentRepository.GetByIdAsync(id);
        }

        public async Task<Payment?> GetPaymentByBookingIdAsync(Guid bookingId)
        {
            return await _paymentRepository.GetByBookingIdAsync(bookingId);
        }

        public async Task<List<Payment>> GetAllPaymentsAsync()
        {
            return await _paymentRepository.GetAllAsync();
        }

        public async Task<List<Payment>> GetPaymentsByStatusAsync(PaymentStatus status)
        {
            return await _paymentRepository.GetByStatusAsync(status);
        }

        public async Task<Payment> CreatePaymentAsync(Payment payment)
        {
            await _paymentRepository.AddAsync(payment);
            await _paymentRepository.SaveChangesAsync();
            return payment;
        }

        public async Task UpdatePaymentAsync(Payment payment)
        {
            _paymentRepository.Update(payment);
            await _paymentRepository.SaveChangesAsync();
        }

        public async Task ProcessPaymentAsync(Guid paymentId, string transactionId)
        {
            var payment = await _paymentRepository.GetByIdAsync(paymentId);
            if (payment != null)
            {
                payment.PaymentStatus = PaymentStatus.Paid;
                payment.TransactionId = transactionId;
                _paymentRepository.Update(payment);
                await _paymentRepository.SaveChangesAsync();

                var booking = await _bookingRepository.GetByIdAsync(payment.BookingId);
                if (booking != null)
                {
                    booking.PaymentStatus = PaymentStatus.Paid;
                    _bookingRepository.Update(booking);
                    await _bookingRepository.SaveChangesAsync();
                }
            }
        }

        public async Task FailPaymentAsync(Guid paymentId)
        {
            var payment = await _paymentRepository.GetByIdAsync(paymentId);
            if (payment != null)
            {
                payment.PaymentStatus = PaymentStatus.Failed;
                _paymentRepository.Update(payment);
                await _paymentRepository.SaveChangesAsync();
            }
        }
    }
}