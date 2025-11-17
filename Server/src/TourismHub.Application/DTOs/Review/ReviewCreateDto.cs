namespace TourismHub.Application.Dtos.Review
{
    public class ReviewCreateDto
    {
        public Guid ActivityId { get; set; }
        public int Rating { get; set; } 
        public required string Comment { get; set; }
    }
}
