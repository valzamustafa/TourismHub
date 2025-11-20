namespace TourismHub.Application.DTOs.Activity
{
    public record ActivityCreateDto(
        Guid ProviderId,
        string Name,
        string Description,
        decimal Price,
        int AvailableSlots,
        string Location,
        string Category
    );
}