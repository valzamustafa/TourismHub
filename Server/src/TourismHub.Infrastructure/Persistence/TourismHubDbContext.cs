using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Entities;
using TourismHub.Infrastructure.Persistence.Configurations;

namespace TourismHub.Infrastructure.Persistence
{
    public class TourismHubDbContext : DbContext
    {
        public TourismHubDbContext(DbContextOptions<TourismHubDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Activity> Activities => Set<Activity>();
        public DbSet<Booking> Bookings => Set<Booking>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<ActivityImage> ActivityImages => Set<ActivityImage>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<AdminLog> AdminLogs => Set<AdminLog>();
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.HasPostgresExtension("uuid-ossp");
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new ActivityConfiguration());
            modelBuilder.ApplyConfiguration(new BookingConfiguration());
            modelBuilder.ApplyConfiguration(new PaymentConfiguration());
            modelBuilder.ApplyConfiguration(new ReviewConfiguration());
            modelBuilder.ApplyConfiguration(new ActivityImageConfiguration());
            modelBuilder.ApplyConfiguration(new AdminLogConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        }
    }
}