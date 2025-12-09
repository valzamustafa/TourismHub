
namespace TourismHub.Application.DTOs
{
    public class ReplyToMessageDto
    {
        public required string Content { get; set; }
        public Guid ReplyToMessageId { get; set; }
    }
}