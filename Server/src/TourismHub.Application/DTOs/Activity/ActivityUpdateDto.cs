
namespace TourismHub.Application.DTOs.Activity
{
    public class ActivityUpdateDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public int? AvailableSlots { get; set; }
        public string? Location { get; set; }
        public string? ProviderName { get; set; } = string.Empty; 
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? CategoryId { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Included { get; set; } = string.Empty;        
         public string Requirements { get; set; } = string.Empty; 
        public string QuickFacts { get; set; } = string.Empty; }
    
}