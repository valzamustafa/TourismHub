// API/Hubs/NotificationHub.cs
using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Collections.Concurrent;

namespace TourismHub.API.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> _userConnections = new();

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                _userConnections.AddOrUpdate(userId, Context.ConnectionId, (key, oldValue) => Context.ConnectionId);
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
                
                Console.WriteLine($"✅ User {userId} connected to SignalR. Connection ID: {Context.ConnectionId}");
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                _userConnections.TryRemove(userId, out _);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
                
                Console.WriteLine($"❌ User {userId} disconnected from SignalR");
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        public static string? GetConnectionId(string userId)
        {
            return _userConnections.TryGetValue(userId, out var connectionId) ? connectionId : null;
        }

        public async Task SendNotificationToUser(string userId, object notification)
        {
            Console.WriteLine($"📤 Sending notification to user {userId}");
            await Clients.Group($"user-{userId}").SendAsync("ReceiveNotification", notification);
        }

        public async Task SendNotificationToAllUsers(object notification)
        {
            await Clients.All.SendAsync("ReceiveNotification", notification);
        }

        public async Task SendTestNotification(string message)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("ReceiveTest", $"Test message for {userId}: {message}");
            }
        }
    }
}