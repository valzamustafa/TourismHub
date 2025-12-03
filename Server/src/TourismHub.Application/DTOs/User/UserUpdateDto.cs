namespace TourismHub.Application.DTOs.User
{
    public class UserUpdateDto
    {
        public required string FullName { get; set; }
        public string? ProfileImage { get; set; }
        public required string Email { get; set; }
        public string? Phone { get; set; } 
        public string? Address { get; set; }
        public string? Bio { get; set; }
    }
}