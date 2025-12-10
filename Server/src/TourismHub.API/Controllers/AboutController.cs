// TourismHub.API/Controllers/AboutController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using TourismHub.Infrastructure.Persistence;
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.About;
using TourismHub.Domain.Enums;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AboutController : ControllerBase
    {
        private readonly TourismHubDbContext _context;
        private readonly ILogger<AboutController> _logger;

        public AboutController(TourismHubDbContext context, ILogger<AboutController> logger)
        {
            _context = context;
            _logger = logger;
        }

      
        [HttpGet]
        public async Task<IActionResult> GetAbout()
        {
            try
            {
                var about = await _context.About.FirstOrDefaultAsync();
                
                if (about == null)
                {
                    about = new About
                    {
                        Id = Guid.NewGuid(),
                        Title = "About TourismHub",
                        Subtitle = "Your Gateway to Unforgettable Adventures",
                        Description = "TourismHub connects adventure seekers with authentic travel experiences worldwide. We work with local experts to provide unique, safe, and memorable activities.",
                        Mission = "To make extraordinary travel experiences accessible to everyone by connecting travelers with local experts and authentic adventures.",
                        Vision = "To be the world's most trusted platform for discovering and booking unique travel experiences.",
                        Values = "[\"Authenticity\",\"Safety First\",\"Customer Satisfaction\",\"Sustainable Tourism\",\"Innovation\"]",
                        ContactEmail = "contact@tourismhub.com",
                        ContactPhone = "+1 (555) 123-4567",
                        Address = "123 Adventure Street, Tourism City, TC 10101",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    
                    _context.About.Add(about);
                    await _context.SaveChangesAsync();
                }

                var providers = await _context.Users
                    .Where(u => u.Role == UserRole.Provider && u.IsActive)
                    .Take(4)
                    .Select(u => new
                    {
                        u.Id,
                        Name = u.FullName,
                        u.Email,
                        Bio = u.Bio ?? $"Expert provider specializing in amazing travel experiences",
                        ImageUrl = !string.IsNullOrEmpty(u.ProfileImage) 
                            ? u.ProfileImage 
                            : $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(u.FullName)}&background=2196F3&color=fff",
                        ActivityCount = _context.Activities.Count(a => a.ProviderId == u.Id)
                    })
                    .ToListAsync();
                var response = new AboutResponseDto
                {
                    Id = about.Id,
                    Title = about.Title ?? string.Empty,
                    Subtitle = about.Subtitle ?? string.Empty,
                    Description = about.Description ?? string.Empty,
                    Mission = about.Mission ?? string.Empty,
                    Vision = about.Vision ?? string.Empty,
                    Values = JsonSerializer.Deserialize<List<string>>(about.Values ?? "[]") ?? new List<string>(),
                    TeamMembers = providers,
                    ContactEmail = about.ContactEmail ?? string.Empty,
                    ContactPhone = about.ContactPhone ?? string.Empty,
                    Address = about.Address ?? string.Empty,
                    LastUpdated = about.UpdatedAt
                };

                return Ok(new
                {
                    success = true,
                    data = response
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting about content");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
      
        [HttpPut]
  
        public async Task<IActionResult> UpdateAbout([FromBody] AboutUpdateDto dto)
        {
            try
            {
                var about = await _context.About.FirstOrDefaultAsync();
                
                if (about == null)
                {
                    about = new About
                    {
                        Id = Guid.NewGuid(),
                        Title = dto.Title ?? "About TourismHub",
                        Subtitle = dto.Subtitle ?? "Your Gateway to Unforgettable Adventures",
                        Description = dto.Description ?? "TourismHub connects adventure seekers with authentic travel experiences worldwide.",
                        Mission = dto.Mission ?? "To make extraordinary travel experiences accessible to everyone.",
                        Vision = dto.Vision ?? "To be the world's most trusted platform for unique travel experiences.",
                        Values = JsonSerializer.Serialize(dto.Values ?? new List<string>()),
                        ContactEmail = dto.ContactEmail ?? "contact@tourismhub.com",
                        ContactPhone = dto.ContactPhone ?? "+1 (555) 123-4567",
                        Address = dto.Address ?? "123 Adventure Street, Tourism City",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.About.Add(about);
                }
                else
                {
                    about.Title = dto.Title ?? about.Title;
                    about.Subtitle = dto.Subtitle ?? about.Subtitle;
                    about.Description = dto.Description ?? about.Description;
                    about.Mission = dto.Mission ?? about.Mission;
                    about.Vision = dto.Vision ?? about.Vision;
                    about.Values = dto.Values != null ? JsonSerializer.Serialize(dto.Values) : about.Values;
                    about.ContactEmail = dto.ContactEmail ?? about.ContactEmail;
                    about.ContactPhone = dto.ContactPhone ?? about.ContactPhone;
                    about.Address = dto.Address ?? about.Address;
                    about.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    message = "About content updated successfully" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating about content");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpGet("providers")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetActiveProviders()
        {
            try
            {
                var providers = await _context.Users
                    .Where(u => u.Role == UserRole.Provider && u.IsActive)
                    .Select(u => new
                    {
                        u.Id,
                        Name = u.FullName,
                        u.Email,
                        u.Bio,
                        ActivityCount = _context.Activities.Count(a => a.ProviderId == u.Id),
                        ImageUrl = !string.IsNullOrEmpty(u.ProfileImage) 
                            ? u.ProfileImage 
                            : $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(u.FullName)}&background=2196F3&color=fff"
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = providers });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting providers");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
        [HttpPost("providers/select")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SelectProviders([FromBody] List<Guid> providerIds)
        {
            try
            {
                var selectedProviders = await _context.Users
                    .Where(u => providerIds.Contains(u.Id) && u.Role == UserRole.Provider && u.IsActive)
                    .Select(u => new
                    {
                        u.Id,
                        Name = u.FullName,
                        u.Email,
                        u.Bio,
                        ActivityCount = _context.Activities.Count(a => a.ProviderId == u.Id),
                        ImageUrl = !string.IsNullOrEmpty(u.ProfileImage) 
                            ? u.ProfileImage 
                            : $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(u.FullName)}&background=2196F3&color=fff"
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = selectedProviders });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error selecting providers");
                return StatusCode(500, new { success = false, message = "Internal server error" });
            }
        }
    }
}