// Application/DTOs/SavedActivity/SavedActivityResponseDto.cs
namespace TourismHub.Application.DTOs.SavedActivity
{
    public class SavedActivityResponseDto
    {
        public Guid Id { get; set; }
        public Guid ActivityId { get; set; }
        public string ActivityName { get; set; } = string.Empty;
        public string ActivityImage { get; set; } = string.Empty;
        public DateTime SavedAt { get; set; }
    }
}