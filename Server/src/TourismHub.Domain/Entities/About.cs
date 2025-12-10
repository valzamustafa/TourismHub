// TourismHub.Domain/Entities/About.cs
namespace TourismHub.Domain.Entities
{
    public class About
    {
        public Guid Id { get; set; }
        public required  string Title { get; set; }
        public string? Subtitle { get; set; }
        public required string Description { get; set; } 
        public required string Mission { get; set; }
        public string? Vision { get; set; }
        public string? Values { get; set; } 
        public required string ContactEmail { get; set; } 
        public required  string ContactPhone { get; set; }
        public required  string Address { get; set; } 
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}