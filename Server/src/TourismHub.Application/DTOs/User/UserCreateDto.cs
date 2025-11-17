using TourismHub.Domain.Enums;

namespace TourismHub.Application.Dtos.User
{
    public class UserCreateDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public UserRole Role { get; set; }
    }
}
