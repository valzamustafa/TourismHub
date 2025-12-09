// TourismHub.Application/Services/ChatService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TourismHub.Application.Interfaces;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly TourismHubDbContext _context;
        private readonly ILogger<ChatService> _logger;

        public ChatService(TourismHubDbContext context, ILogger<ChatService> logger)
        {
            _context = context;
            _logger = logger;
        }
        public async Task<Chat?> GetChatByIdAsync(Guid chatId)
{
    try
    {
        _logger.LogInformation($"Getting chat by ID: {chatId}");
        
        var chat = await _context.Chats
            .Include(c => c.Provider)
            .Include(c => c.Tourist)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == chatId);

        return chat;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error getting chat by ID: {chatId}");
        throw;
    }
}

        public async Task<Chat> StartChatAsync(Guid userId, Guid otherUserId)
{
    try
    {
        _logger.LogInformation($"Starting chat between {userId} and {otherUserId}");
        

        var existingChat = await _context.Chats
            .Include(c => c.Provider)
            .Include(c => c.Tourist)
            .FirstOrDefaultAsync(c => 
                (c.ProviderId == userId && c.TouristId == otherUserId) ||
                (c.ProviderId == otherUserId && c.TouristId == userId));

        if (existingChat != null)
        {
            _logger.LogInformation($"Chat already exists: {existingChat.Id}");
            return existingChat;
        }


        var user = await _context.Users.FindAsync(userId);
        var otherUser = await _context.Users.FindAsync(otherUserId);
        
        if (user == null || otherUser == null)
        {
            _logger.LogError($"User not found: {userId} or {otherUserId}");
            throw new InvalidOperationException("User not found");
        }


        Guid providerId, touristId;
        
        if (user.Role == UserRole.Provider && otherUser.Role == UserRole.Tourist)
        {
            providerId = user.Id;
            touristId = otherUser.Id;
        }
        else if (otherUser.Role == UserRole.Provider && user.Role == UserRole.Tourist)
        {
            providerId = otherUser.Id;
            touristId = user.Id;
        }
        else if (user.Role == UserRole.Provider && otherUser.Role == UserRole.Provider)
        {
          
            providerId = user.Id;
            touristId = otherUser.Id;
        }
        else if (user.Role == UserRole.Tourist && otherUser.Role == UserRole.Tourist)
        {

            providerId = user.Id;
            touristId = otherUser.Id;
        }
        else
        {
  
            providerId = user.Role == UserRole.Admin ? user.Id : otherUser.Id;
            touristId = user.Role == UserRole.Admin ? otherUser.Id : user.Id;
        }


        var chat = new Chat
        {
            Id = Guid.NewGuid(),
            ProviderId = providerId,
            TouristId = touristId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            LastMessage = "Chat started",
            LastMessageAt = DateTime.UtcNow
        };

        await _context.Chats.AddAsync(chat);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"New chat created: {chat.Id}");
        return chat;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error starting chat between {userId} and {otherUserId}");
        throw;
    }
}
        public async Task<List<Chat>> GetUserChatsAsync(Guid userId)
        {
            try
            {
                _logger.LogInformation($"Getting chats for user: {userId}");
                
                var chats = await _context.Chats
                    .Include(c => c.Provider)
                    .Include(c => c.Tourist)
                    .Include(c => c.Messages)
                    .Where(c => c.ProviderId == userId || c.TouristId == userId)
                    .OrderByDescending(c => c.LastMessageAt)
                    .ToListAsync();

                _logger.LogInformation($"Found {chats.Count} chats for user {userId}");
                return chats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting chats for user: {userId}");
                throw;
            }
        }
public async Task<List<Chat>> GetAllChatsForAdminAsync()
{
    return await _context.Chats
        .Include(c => c.Tourist)
        .Include(c => c.Provider)
        .Include(c => c.Messages)
        .OrderByDescending(c => c.LastMessageAt)
        .ToListAsync();
}

public async Task<Chat> StartChatAsAdminAsync(Guid adminId, Guid otherUserId)
{
    var admin = await _context.Users.FindAsync(adminId);
    var otherUser = await _context.Users.FindAsync(otherUserId);
    
    if (admin == null || otherUser == null)
        throw new Exception("User not found");
    

    var existingChat = await _context.Chats
        .FirstOrDefaultAsync(c => 
            (c.ProviderId == adminId && c.TouristId == otherUserId) ||
            (c.ProviderId == otherUserId && c.TouristId == adminId));
    
    if (existingChat != null)
        return existingChat;
    

    var chat = new Chat
    {
        Id = Guid.NewGuid(),
        ProviderId = adminId,
        TouristId = otherUserId,
        CreatedAt = DateTime.UtcNow,
        LastMessageAt = DateTime.UtcNow,
        LastMessage = "Chat started by admin"
    };
    
    _context.Chats.Add(chat);
    await _context.SaveChangesAsync();
    
    return chat;
}

public async Task<Chat> GetOrCreateChatForActivityAsync(Guid activityId)
{
    var activity = await _context.Activities
        .Include(a => a.Provider)
        .FirstOrDefaultAsync(a => a.Id == activityId);
    
    if (activity == null)
        throw new Exception("Activity not found");
    

    if (activity.ProviderId == null || activity.ProviderId == Guid.Empty)
        throw new Exception("Activity does not have a valid provider");
    

    var admin = await _context.Users
        .FirstOrDefaultAsync(u => u.Role == Domain.Enums.UserRole.Admin);
    
    if (admin == null)
        throw new Exception("Admin not found");
    

    var existingChat = await _context.Chats
        .FirstOrDefaultAsync(c => 
            c.ProviderId == admin.Id && 
            c.TouristId == activity.ProviderId.Value); 
    
    if (existingChat != null)
        return existingChat;
    

    var chat = new Chat
    {
        Id = Guid.NewGuid(),
        ProviderId = admin.Id,
        TouristId = activity.ProviderId.Value, 
        CreatedAt = DateTime.UtcNow,
        LastMessageAt = DateTime.UtcNow,
        LastMessage = $"Chat started about activity: {activity.Name}"
    };
    
    _context.Chats.Add(chat);
    await _context.SaveChangesAsync();
    
    return chat;
}
        public async Task<List<ChatMessage>> GetChatMessagesAsync(Guid chatId, Guid userId)
        {
            try
            {
                _logger.LogInformation($"Getting messages for chat: {chatId}, user: {userId}");
                
         
                var chat = await _context.Chats
                    .FirstOrDefaultAsync(c => c.Id == chatId && 
                        (c.ProviderId == userId || c.TouristId == userId));

                if (chat == null)
                {
                    _logger.LogWarning($"User {userId} not authorized for chat {chatId}");
                    throw new UnauthorizedAccessException("Access denied to this chat");
                }

                var messages = await _context.ChatMessages
                    .Include(m => m.Sender)
                    .Where(m => m.ChatId == chatId)
                    .OrderBy(m => m.SentAt)
                    .ToListAsync();

                _logger.LogInformation($"Found {messages.Count} messages for chat {chatId}");
                return messages;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting messages for chat: {chatId}");
                throw;
            }
        }

        public async Task<ChatMessage> SendMessageAsync(Guid chatId, Guid senderId, string content)
        {
            try
            {
                _logger.LogInformation($"Sending message to chat: {chatId}, sender: {senderId}");
                
                if (string.IsNullOrWhiteSpace(content))
                {
                    throw new ArgumentException("Message content cannot be empty");
                }

      
                var chat = await _context.Chats
                    .FirstOrDefaultAsync(c => c.Id == chatId && 
                        (c.ProviderId == senderId || c.TouristId == senderId));

                if (chat == null)
                {
                    _logger.LogWarning($"Sender {senderId} not authorized for chat {chatId}");
                    throw new UnauthorizedAccessException("Cannot send message to this chat");
                }

                var message = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    ChatId = chatId,
                    SenderId = senderId,
                    Content = content.Trim(),
                    SentAt = DateTime.UtcNow,
                    IsRead = false
                };

           
                chat.LastMessage = content.Length > 500 ? content.Substring(0, 497) + "..." : content;
                chat.LastMessageAt = DateTime.UtcNow;
                chat.UpdatedAt = DateTime.UtcNow;

                await _context.ChatMessages.AddAsync(message);
                _context.Chats.Update(chat);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Message sent: {message.Id}");
                return message;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending message to chat: {chatId}");
                throw;
            }
        }

        public async Task MarkAsReadAsync(Guid chatId, Guid userId)
        {
            try
            {
                _logger.LogInformation($"Marking messages as read for chat: {chatId}, user: {userId}");
                
                var unreadMessages = await _context.ChatMessages
                    .Where(m => m.ChatId == chatId && 
                        m.SenderId != userId && 
                        !m.IsRead)
                    .ToListAsync();

                foreach (var message in unreadMessages)
                {
                    message.IsRead = true;
                }

                if (unreadMessages.Any())
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Marked {unreadMessages.Count} messages as read");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking messages as read for chat: {chatId}");
                throw;
            }
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            try
            {
                var unreadCount = await _context.ChatMessages
                    .Include(m => m.Chat)
                    .Where(m => (m.Chat.ProviderId == userId || m.Chat.TouristId == userId))
                    .Where(m => m.SenderId != userId && !m.IsRead)
                    .CountAsync();

                return unreadCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting unread count for user: {userId}");
                return 0;
            }
        }
    }
}