using TourismHub.Domain.Enums;

namespace TourismHub.Application.DTOs.User
{
    public class UserViewDto
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public UserRole Role { get; set; }
        public string? ProfileImage { get; set; }
    }
}