using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Web;

namespace TourismHub.Infrastructure.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string name, string resetToken, string origin);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string email, string name, string resetToken, string origin)
        {
            try
            {
                var frontendUrl = _configuration["FrontendUrl"] ?? origin;
                
                var encodedToken = System.Web.HttpUtility.UrlEncode(resetToken);
                var resetUrl = $"{frontendUrl}/reset-password?token={encodedToken}";
                
                Console.WriteLine($"🔗 Generating reset URL for: {email}");
                Console.WriteLine($"🔗 Frontend URL: {frontendUrl}");
                Console.WriteLine($"🔗 Token: {resetToken}");
                Console.WriteLine($"🔗 Encoded Token: {encodedToken}");
                Console.WriteLine($"🔗 Full URL: {resetUrl}");
                
                _logger.LogInformation($"Password reset token for {email}: {resetToken}");
                _logger.LogInformation($"Reset URL: {resetUrl}");

                var emailConfig = _configuration.GetSection("Email");
                var smtpHost = emailConfig["SmtpHost"];
                
                if (string.IsNullOrEmpty(smtpHost))
                {
                    _logger.LogInformation("Email configuration not found. Email not sent.");
                    return;
                }

                var smtpPort = int.Parse(emailConfig["SmtpPort"] ?? "587");
                var smtpUsername = emailConfig["SmtpUsername"];
                var smtpPassword = emailConfig["SmtpPassword"];
                var fromAddress = emailConfig["FromAddress"] ?? "noreply@tourismhub.com";
                var fromName = emailConfig["FromName"] ?? "TourismHub";
                var enableSsl = bool.Parse(emailConfig["EnableSsl"] ?? "true");

                using var smtpClient = new SmtpClient(smtpHost)
                {
                    Port = smtpPort,
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    EnableSsl = enableSsl,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    Timeout = 10000
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromAddress, fromName),
                    Subject = "TourismHub - Password Reset",
                    Body = CreateEmailBody(name, resetUrl, resetToken),
                    IsBodyHtml = true,
                };

                mailMessage.To.Add(email);

                await smtpClient.SendMailAsync(mailMessage);
                
                _logger.LogInformation($"✅ Password reset email sent to: {email}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error sending password reset email to {email}");
                Console.WriteLine($"❌ Email error: {ex.Message}");
            }
        }

        private string CreateEmailBody(string name, string resetUrl, string plainToken)
        {
            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }}
                    .header {{ color: #4CAF50; text-align: center; }}
                    .button {{ background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }}
                    .code {{ background-color: #f4f4f4; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all; }}
                    .warning {{ color: #ff9800; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2 class='header'>TourismHub Password Reset</h2>
                    <p>Hello <strong>{name}</strong>,</p>
                    <p>You requested to reset your password for your TourismHub account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{resetUrl}' class='button'>Reset Password</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <div class='code'>{resetUrl}</div>
                    <p class='warning'>⚠️ This link will expire in 24 hours.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                    <p style='font-size: 12px; color: #777; text-align: center;'>
                        This is an automated message, please do not reply to this email.<br>
                        © {DateTime.Now.Year} TourismHub. All rights reserved.
                    </p>
                </div>
            </body>
            </html>";
        }
    }
}