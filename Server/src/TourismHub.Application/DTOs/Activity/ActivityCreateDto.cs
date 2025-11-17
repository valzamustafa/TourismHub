namespace TourismHub.Application.Dtos.Activity
{
    public class ActivityCreateDto
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public int AvailableSlots { get; set; }
        public required string Location { get; set; }
        public required string Category { get; set; }
    }
}
