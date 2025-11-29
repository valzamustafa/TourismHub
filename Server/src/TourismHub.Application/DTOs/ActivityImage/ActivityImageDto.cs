namespace TourismHub.Application.DTOs.ActivityImage
{
    public class ActivityImageDto
    {
        public Guid Id { get; set; }
        public Guid ActivityId { get; set; }
        public required string ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}