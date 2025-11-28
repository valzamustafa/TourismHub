namespace TourismHub.Application.DTOs.Activity
{
    public class ActivityCreateDto
    {
        public Guid ProviderId { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public int AvailableSlots { get; set; }
        public required string Location { get; set; }
         public Guid CategoryId { get; set; } 
    }
}