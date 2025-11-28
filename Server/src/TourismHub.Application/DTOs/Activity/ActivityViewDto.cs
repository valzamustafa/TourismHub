namespace TourismHub.Application.DTOs.Activity
{
    public class ActivityViewDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public int AvailableSlots { get; set; }
        public required string Location { get; set; }
         public Guid CategoryId { get; set; } 
        public required string ProviderName { get; set; }
    }
}
