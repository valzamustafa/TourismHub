// Faji SavedActivityResponseDto.cs dhe përdor vetëm këtë:
using System;

namespace TourismHub.Application.DTOs.SavedActivity
{
    public class SavedActivityDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ActivityId { get; set; }
        public string ActivityName { get; set; } = string.Empty; 
        public string ActivityImage { get; set; } = string.Empty; 
        public decimal ActivityPrice { get; set; }
        public string ActivityLocation { get; set; } = string.Empty; 
        public string ActivityCategory { get; set; } = string.Empty; 
        public DateTime SavedAt { get; set; }
    }

 
}