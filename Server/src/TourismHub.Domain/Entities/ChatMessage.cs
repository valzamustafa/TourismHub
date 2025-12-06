using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourismHub.Domain.Entities
{
    public class ChatMessage
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid ChatId { get; set; }
        
        [Required]
        public Guid SenderId { get; set; }
        
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
        
        public bool IsRead { get; set; } = false;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("ChatId")]
        public virtual Chat Chat { get; set; } = null!;
        
        [ForeignKey("SenderId")]
        public virtual User Sender { get; set; } = null!;
    }
}