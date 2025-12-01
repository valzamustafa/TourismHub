using TourismHub.Domain.Enums;
using System.Text.Json.Serialization;

namespace TourismHub.Application.DTOs.Activity
{
    public class ActivityStatusUpdateDto
    {
        [JsonPropertyName("Status")]
        [JsonConverter(typeof(JsonStringEnumConverter))] 
        public ActivityStatus Status { get; set; }
    }
}