using System;
using System.Collections.Generic;

namespace TourismHub.Application.DTOs.Chat
{
    public class ChatDto
    {
        public Guid Id { get; set; }
        public UserDto Provider { get; set; } = null!;
        public UserDto Tourist { get; set; } = null!;
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public int UnreadCount { get; set; }
    }



    
}