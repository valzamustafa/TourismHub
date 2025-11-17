namespace TourismHub.Application.Dtos.Review
{
    public class ReviewViewDto
    {
        public Guid Id { get; set; }
        public Guid ActivityId { get; set; }
        public required string UserName { get; set; }
        public int Rating { get; set; }
        public required string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
