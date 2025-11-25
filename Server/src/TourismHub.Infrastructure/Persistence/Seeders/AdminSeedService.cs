using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

namespace TourismHub.Infrastructure.Persistence.Seeders;

public class AdminSeedService
{
    private readonly TourismHubDbContext _context;

    public AdminSeedService(TourismHubDbContext context)
    {
        _context = context;
    }

    public async Task SeedAdminAsync()
    {
       
        if (!await _context.Users.AnyAsync(u => u.Role == UserRole.Admin))
        {
            var adminUser = new User
            {
                Id = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                FullName = "System Administrator",
                Email = "admin@tourismhub.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = UserRole.Admin,
                ProfileImage = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _context.Users.AddAsync(adminUser);
            await _context.SaveChangesAsync();
            
            Console.WriteLine("✅ Admin user created successfully!");
            Console.WriteLine($"📧 Email: admin@tourismhub.com");
            Console.WriteLine($"🔑 Password: Admin123!");
        }
        else
        {
            Console.WriteLine("✅ Admin user already exists!");
        }
    }
}