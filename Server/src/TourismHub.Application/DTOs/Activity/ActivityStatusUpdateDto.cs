using TourismHub.Domain.Enums;
using System.Text.Json.Serialization;
using System;

namespace TourismHub.Application.DTOs.Activity
{
    public class ActivityStatusUpdateDto
    {
        [JsonPropertyName("Status")]
        [JsonConverter(typeof(JsonStringEnumConverter))] 
        public ActivityStatus Status { get; set; }
        
        [JsonPropertyName("DelayedDate")]
        public DateTime? DelayedDate { get; set; }
        
        [JsonPropertyName("RescheduledStartDate")]
        public DateTime? RescheduledStartDate { get; set; }
        
        [JsonPropertyName("RescheduledEndDate")]
        public DateTime? RescheduledEndDate { get; set; }
    }
}