using System.Text.Json.Serialization;
using TourismHub.Domain.Enums;

namespace TourismHub.Application.DTOs.User
{
    public class UserCreateDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        
        // Përdor string në vend të UserRole enum
        public required string Role { get; set; }
    }
}