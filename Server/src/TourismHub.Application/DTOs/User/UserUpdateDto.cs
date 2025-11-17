using TourismHub.Enums;

namespace TourismHub.Dtos.User
{
    public class UserUpdateDto
    {
        public required string FullName { get; set; }
        public string? ProfileImage { get; set; }
    }
}
