using TourismHub.Domain.Enums;

namespace TourismHub.Application.DTOs.User
{
    public class UserCreateDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public UserRole Role { get; set; }
    }
}