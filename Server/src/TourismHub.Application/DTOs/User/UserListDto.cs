// DTOs/User/UserListDto.cs
namespace TourismHub.Application.DTOs.User
{
    public class UserListDto
    {
        public string Id { get; set; } = string.Empty;
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public required string JoinDate { get; set; }
        public required string Status { get; set; }
    }
}