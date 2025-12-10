namespace TourismHub.Application.Dtos.Review
{
    public record ReviewUpdateDto(
        int Rating,
        string Comment
    );
}