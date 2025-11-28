// Application/DTOs/Category/CategoryViewDto.cs
namespace TourismHub.Application.DTOs.Category
{
    public class CategoryViewDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
        public bool Featured { get; set; }
        public int ActivityCount { get; set; }
    }
}