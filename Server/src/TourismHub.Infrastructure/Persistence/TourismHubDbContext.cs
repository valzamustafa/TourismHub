using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Infrastructure.Persistence.Configurations;
using TourismHub.Persistence.Configurations;

namespace TourismHub.Infrastructure.Persistence
{
    public class TourismHubDbContext : DbContext
    {
        public TourismHubDbContext(DbContextOptions<TourismHubDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
        public DbSet<Activity> Activities => Set<Activity>();
        public DbSet<Booking> Bookings => Set<Booking>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<ActivityImage> ActivityImages => Set<ActivityImage>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<SavedActivity> SavedActivities => Set<SavedActivity>(); // ✅
        public DbSet<AdminLog> AdminLogs => Set<AdminLog>();
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Chat> Chats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasPostgresExtension("uuid-ossp");
            
            // Apply configurations
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new ActivityConfiguration());
            modelBuilder.ApplyConfiguration(new BookingConfiguration());
            modelBuilder.ApplyConfiguration(new PaymentConfiguration());
            modelBuilder.ApplyConfiguration(new ReviewConfiguration());
            modelBuilder.ApplyConfiguration(new ActivityImageConfiguration());
            modelBuilder.ApplyConfiguration(new AdminLogConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryConfiguration());
            modelBuilder.ApplyConfiguration(new SavedActivityConfiguration()); 
            modelBuilder.ApplyConfiguration(new ChatConfiguration()); 
            modelBuilder.ApplyConfiguration(new ChatMessageConfiguration()); 
             modelBuilder.Entity<PasswordResetToken>()
                .HasOne(t => t.User)
                .WithMany(u => u.PasswordResetTokens)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}