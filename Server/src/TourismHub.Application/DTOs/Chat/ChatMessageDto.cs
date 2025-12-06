using System;
using System.Collections.Generic;

namespace TourismHub.Application.DTOs
{
    public class ChatMessageDto
    {
        public Guid Id { get; set; }
        public Guid ChatId { get; set; }
        public Guid SenderId { get; set; }
        public UserDto Sender { get; set; } = null!;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsSender { get; set; }
    }


}