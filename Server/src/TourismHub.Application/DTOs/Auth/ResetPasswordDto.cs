// TourismHub.Application/DTOs/Auth/ResetPasswordDto.cs
namespace TourismHub.Application.DTOs.Auth
{
    public class ResetPasswordDto
    {
        public required string Token { get; set; }
        public required string NewPassword { get; set; }
        public required string ConfirmPassword { get; set; }
    }
}