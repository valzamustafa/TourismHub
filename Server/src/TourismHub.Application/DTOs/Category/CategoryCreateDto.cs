// Application/DTOs/Category/CategoryCreateDto.cs
namespace TourismHub.Application.DTOs.Category
{
    public class CategoryCreateDto
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
        public bool Featured { get; set; }
    }
}