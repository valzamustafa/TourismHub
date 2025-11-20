namespace TourismHub.Application.DTOs.ActivityImage
{
    public record ActivityImageCreateDto(
        Guid ActivityId,
        string ImageUrl
    );
}