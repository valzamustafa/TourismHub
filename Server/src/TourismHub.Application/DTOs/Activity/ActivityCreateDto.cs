using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace TourismHub.Application.DTOs.Activity
{
    public class ActivityCreateDto
    {
        public Guid? ProviderId { get; set; }
        public string ProviderName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Price is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }
        
        [Required(ErrorMessage = "Available slots are required")]
        [Range(1, int.MaxValue, ErrorMessage = "Available slots must be at least 1")]
        public int AvailableSlots { get; set; }
        
        public string Duration { get; set; } = "2 hours";
   
        public string? Included { get; set; }
        public string? Requirements { get; set; }
        public string? QuickFacts { get; set; }
        
        [Required(ErrorMessage = "Location is required")]
        public string Location { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Start date is required")]
        public DateTime StartDate { get; set; }
        
        [Required(ErrorMessage = "End date is required")]
        public DateTime EndDate { get; set; }
        
        [Required(ErrorMessage = "Category ID is required")]
        public Guid CategoryId { get; set; }
        
        public List<IFormFile>? Images { get; set; }
    }
}