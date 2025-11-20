namespace TourismHub.Application.DTOs.Review
{
    public record ReviewCreateDto(
        Guid ActivityId,
        Guid UserId,
        int Rating,
        string Comment
    );
}