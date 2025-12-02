// Application/DTOs/SavedActivity/SavedActivityDto.cs
namespace TourismHub.Application.DTOs.SavedActivity
{
    

   public class SaveActivityRequestDto
    {
        public Guid UserId { get; set; }
        public Guid ActivityId { get; set; }
    }
}