// Domain/Entities/Category.cs
namespace TourismHub.Domain.Entities
{
    public class Category
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public required string ImageUrl { get; set; }
        public bool Featured { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
     
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    }
}