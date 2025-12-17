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
        public DbSet<StripeApiKey> StripeApiKeys { get; set; }
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<ActivityImage> ActivityImages => Set<ActivityImage>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<SavedActivity> SavedActivities => Set<SavedActivity>(); 
        public DbSet<Notification> Notifications => Set<Notification>(); 
        public DbSet<AdminLog> AdminLogs => Set<AdminLog>();
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Chat> Chats { get; set; }
public DbSet<About> About { get; set; }
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
             modelBuilder.ApplyConfiguration(new NotificationConfiguration()); 
             modelBuilder.Entity<PasswordResetToken>()
                .HasOne(t => t.User)
                .WithMany(u => u.PasswordResetTokens)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                modelBuilder.Entity<StripeApiKey>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.SecretKey)
                    .IsRequired()
                    .HasMaxLength(500);
                    
                entity.Property(e => e.PublishableKey)
                    .IsRequired()
                    .HasMaxLength(200);
                    
                entity.Property(e => e.KeyId)
                    .IsRequired()
                    .HasMaxLength(100);
                    
                entity.Property(e => e.Environment)
                    .IsRequired()
                    .HasMaxLength(10);
                    
                entity.Property(e => e.Description)
                    .HasMaxLength(255);
                    
                entity.Property(e => e.CreatedBy)
                    .IsRequired()
                    .HasMaxLength(100);
                    
                entity.Property(e => e.RevokedBy)
                    .HasMaxLength(100);
                    
                entity.Property(e => e.RevokedReason)
                    .HasMaxLength(500);
                    
                entity.HasIndex(e => new { e.Environment, e.IsActive });
                entity.HasIndex(e => e.ExpiresAt);
                entity.HasIndex(e => e.KeyId)
                    .IsUnique();
            });
        }
    }
}