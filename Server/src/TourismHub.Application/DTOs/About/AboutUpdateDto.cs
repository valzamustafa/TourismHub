
namespace TourismHub.Application.DTOs.About
{
    public class AboutUpdateDto
    {
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? Description { get; set; }
        public string? Mission { get; set; }
        public string? Vision { get; set; }
        public List<string>? Values { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? Address { get; set; }
    }

    public class AboutResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Mission { get; set; } = string.Empty;
        public string Vision { get; set; } = string.Empty;
        public List<string> Values { get; set; } = new List<string>();
        public object TeamMembers { get; set; } = new List<object>();
        public string ContactEmail { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
    }
}