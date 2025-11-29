using Microsoft.AspNetCore.Http;

namespace TourismHub.Application.DTOs.ActivityImage
{
    public class ActivityImageUploadDto
    {
        public required IFormFile Image { get; set; }
    }
}