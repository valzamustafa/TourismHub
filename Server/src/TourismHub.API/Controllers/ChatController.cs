using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using TourismHub.API.Hubs;
using TourismHub.Application.DTOs;
using TourismHub.Application.Interfaces;
using TourismHub.Application.Interfaces.Services;
using TourismHub.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using TourismHub.Infrastructure.Persistence;
using TourismHub.Application.Services;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatsController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatsController> _logger;
        private readonly TourismHubDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly UserService _userService;

        public ChatsController(
            IChatService chatService, 
            ILogger<ChatsController> logger,
            TourismHubDbContext context,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubContext,
            UserService userService)
        {
            _chatService = chatService;
            _logger = logger;
            _context = context;
            _notificationService = notificationService;
            _hubContext = hubContext;
            _userService = userService;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }
            return Guid.Parse(userIdClaim);
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartChat([FromBody] StartChatDto dto)
        {
            try
            {
                var userId = GetUserId();
                var chat = await _chatService.StartChatAsync(userId, dto.OtherUserId);
                
                // ✅ Dërgo notifikim për user-in tjetër
                await _notificationService.SendRealTimeNotification(
                    _hubContext,
                    dto.OtherUserId,
                    "New Chat Started",
                    $"{User.FindFirst(ClaimTypes.Name)?.Value ?? "Someone"} started a chat with you.",
                    NotificationType.Message,
                    chat.Id
                );

                return Ok(new { 
                    success = true, 
                    chatId = chat.Id,
                    message = "Chat started successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting chat");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-chats")]
        public async Task<IActionResult> GetMyChats()
        {
            try
            {
                var userId = GetUserId();
                var chats = await _chatService.GetUserChatsAsync(userId);
                
                var chatDtos = chats.Select(c => new
                {
                    c.Id,
                    OtherUser = c.ProviderId == userId ? 
                        new { 
                            c.Tourist.Id, 
                            c.Tourist.FullName, 
                            c.Tourist.ProfileImage,
                            Role = c.Tourist.Role.ToString()
                        } :
                        new { 
                            c.Provider.Id, 
                            c.Provider.FullName, 
                            c.Provider.ProfileImage,
                            Role = c.Provider.Role.ToString()
                        },
                    c.LastMessage,
                    c.LastMessageAt,
                    UnreadCount = c.Messages.Count(m => !m.IsRead && m.SenderId != userId)
                }).OrderByDescending(c => c.LastMessageAt);
                
                return Ok(new { 
                    success = true, 
                    chats = chatDtos
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chats");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{chatId}/messages")]
        public async Task<IActionResult> GetMessages(Guid chatId)
        {
            try
            {
                var userId = GetUserId();
                var messages = await _chatService.GetChatMessagesAsync(chatId, userId);
                
                await _chatService.MarkAsReadAsync(chatId, userId);
                
                var messageDtos = messages.Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.SentAt,
                    m.IsRead,
                    IsSender = m.SenderId == userId,
                    Sender = new
                    {
                        m.Sender.Id,
                        m.Sender.FullName,
                        m.Sender.ProfileImage
                    }
                });
                
                return Ok(new { 
                    success = true, 
                    messages = messageDtos
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting messages");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{chatId}/send")]
        public async Task<IActionResult> SendMessage(Guid chatId, [FromBody] SendMessageDto dto)
        {
            try
            {
                var userId = GetUserId();
                var message = await _chatService.SendMessageAsync(chatId, userId, dto.Content);
                
        
                var chat = await _chatService.GetChatByIdAsync(chatId);
                if (chat != null)
                {
                    var recipientId = chat.ProviderId == userId ? chat.TouristId : chat.ProviderId;
                    
              
                    await _notificationService.SendRealTimeNotification(
                        _hubContext,
                        recipientId,
                        "New Message",
                        $"{User.FindFirst(ClaimTypes.Name)?.Value ?? "Someone"}: {dto.Content}",
                        NotificationType.Message,
                        chatId
                    );
                }

                return Ok(new { 
                    success = true, 
                    message = new {
                        message.Id,
                        message.Content,
                        message.SentAt,
                        message.IsRead,
                        IsSender = true,
                        Sender = new {
                            Id = userId,
                            FullName = User.FindFirst(ClaimTypes.Name)?.Value,
                            ProfileImage = ""
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{chatId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid chatId)
        {
            try
            {
                var userId = GetUserId();
                await _chatService.MarkAsReadAsync(chatId, userId);
                
                return Ok(new { 
                    success = true,
                    message = "Messages marked as read"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking messages as read");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = GetUserId();
                var count = await _chatService.GetUnreadCountAsync(userId);
                
                return Ok(new { 
                    success = true,
                    unreadCount = count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllChatsForAdmin()
        {
            try
            {
                var chats = await _chatService.GetAllChatsForAdminAsync();
                
                var chatDtos = chats.Select(c => new
                {
                    c.Id,
                    Tourist = new { 
                        c.Tourist.Id, 
                        c.Tourist.FullName, 
                        c.Tourist.Email,
                        Role = c.Tourist.Role.ToString()
                    },
                    Provider = new { 
                        c.Provider.Id, 
                        c.Provider.FullName, 
                        c.Provider.Email,
                        Role = c.Provider.Role.ToString()
                    },
                    c.LastMessage,
                    c.LastMessageAt,
                    UnreadCount = c.Messages.Count(m => !m.IsRead)
                }).OrderByDescending(c => c.LastMessageAt);
                
                return Ok(new { 
                    success = true, 
                    chats = chatDtos
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admin chats");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("admin/start")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> StartChatAsAdmin([FromBody] StartChatDto dto)
        {
            try
            {
                var adminId = GetUserId();
                var chat = await _chatService.StartChatAsAdminAsync(adminId, dto.OtherUserId);
                
          
                await _notificationService.SendRealTimeNotification(
                    _hubContext,
                    dto.OtherUserId,
                    "Admin Started Chat",
                    "An admin has started a chat with you.",
                    NotificationType.Message,
                    chat.Id
                );

                return Ok(new { 
                    success = true, 
                    chatId = chat.Id,
                    message = "Chat started by admin successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting chat as admin");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{chatId}")]
        public async Task<IActionResult> GetChatInfo(Guid chatId)
        {
            try
            {
                var userId = GetUserId();
                var chats = await _chatService.GetUserChatsAsync(userId);
                var chat = chats.FirstOrDefault(c => c.Id == chatId);
                
                if (chat == null)
                {
                    return NotFound(new { message = "Chat not found or access denied" });
                }
                
                var chatInfo = new
                {
                    chat.Id,
                    OtherUser = chat.ProviderId == userId ? 
                        new { 
                            chat.Tourist.Id, 
                            chat.Tourist.FullName, 
                            chat.Tourist.ProfileImage,
                            Role = chat.Tourist.Role.ToString()
                        } :
                        new { 
                            chat.Provider.Id, 
                            chat.Provider.FullName, 
                            chat.Provider.ProfileImage,
                            Role = chat.Provider.Role.ToString()
                        }
                };
                
                return Ok(new { 
                    success = true,
                    chat = chatInfo
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chat info");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}