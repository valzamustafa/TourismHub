using TourismHub.Domain.Enums;

namespace TourismHub.Application.Dtos.User
{
    public class UserUpdateDto
    {
        public required string FullName { get; set; }
        public string? ProfileImage { get; set; }
    }
}
