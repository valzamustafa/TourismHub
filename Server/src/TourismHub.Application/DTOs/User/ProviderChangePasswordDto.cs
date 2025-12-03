// TourismHub.Application/DTOs/User/ProviderChangePasswordDto.cs
namespace TourismHub.Application.DTOs.User
{
    public class ProviderChangePasswordDto
    {
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
        public required string ConfirmPassword { get; set; }
    }
}