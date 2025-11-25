using System.Text.Json.Serialization;
using TourismHub.Domain.Enums;

namespace TourismHub.Application.DTOs.Auth;

public class RegisterRequestDto
{
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole Role { get; set; } = UserRole.Tourist;
}