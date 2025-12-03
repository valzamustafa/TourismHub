namespace TourismHub.Application.Interfaces.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string name, string resetToken, string origin);
    }
}