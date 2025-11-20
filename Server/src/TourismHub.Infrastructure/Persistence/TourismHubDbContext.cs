// Infrastructure/Persistence/TourismHubDbContext.cs
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
        public DbSet<AdminLog> AdminLogs => Set<AdminLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new ActivityConfiguration());
            modelBuilder.ApplyConfiguration(new BookingConfiguration());
            modelBuilder.ApplyConfiguration(new PaymentConfiguration());
            modelBuilder.ApplyConfiguration(new ReviewConfiguration());
            modelBuilder.ApplyConfiguration(new ActivityImageConfiguration());
            modelBuilder.ApplyConfiguration(new AdminLogConfiguration());
        }
    }
}