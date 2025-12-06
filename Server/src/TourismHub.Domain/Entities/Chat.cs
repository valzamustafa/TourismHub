using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using TourismHub.Domain.Enums;

namespace TourismHub.Domain.Entities
{
    public class Chat
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid ProviderId { get; set; }
        
        [Required]
        public Guid TouristId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string LastMessage { get; set; } = string.Empty;
        
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("ProviderId")]
        public virtual User Provider { get; set; } = null!;
        
        [ForeignKey("TouristId")]
        public virtual User Tourist { get; set; } = null!;
        
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>(); // Ndrysho në ChatMessage
    }
}