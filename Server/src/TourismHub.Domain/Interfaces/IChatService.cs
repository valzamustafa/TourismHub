// TourismHub.Application/Interfaces/IChatService.cs
using TourismHub.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TourismHub.Application.Interfaces
{
    public interface IChatService
    {
        Task<Chat> StartChatAsync(Guid userId, Guid otherUserId);
        Task<List<Chat>> GetUserChatsAsync(Guid userId);
        Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatId, Guid userId);
        Task<ChatMessage> SendMessageAsync(Guid chatId, Guid senderId, string content);
        Task MarkAsReadAsync(Guid chatId, Guid userId);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task<Chat?> GetChatByIdAsync(Guid chatId);
        Task<List<Chat>> GetAllChatsForAdminAsync();
        Task<Chat> StartChatAsAdminAsync(Guid adminId, Guid otherUserId);
        Task<Chat> GetOrCreateChatForActivityAsync(Guid activityId);
    }
}