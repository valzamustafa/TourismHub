// Infrastructure/Persistence/Configurations/NotificationConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

namespace TourismHub.Infrastructure.Persistence.Configurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notifications");

  
            builder.HasKey(n => n.Id);

         
            builder.Property(n => n.Id)
                .ValueGeneratedOnAdd()
                .IsRequired();

            builder.Property(n => n.Title)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(n => n.Message)
                .HasMaxLength(2000)
                .IsRequired();

            builder.Property(n => n.Type)
                .HasConversion<int>()
                .IsRequired();

            builder.Property(n => n.RelatedId)
                .IsRequired(false);

            builder.Property(n => n.IsRead)
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(n => n.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP") 
                .IsRequired();

            builder.HasIndex(n => n.UserId);
            builder.HasIndex(n => n.IsRead);
            builder.HasIndex(n => n.CreatedAt);
            builder.HasIndex(n => n.Type);
            builder.HasIndex(n => n.RelatedId);
            builder.HasIndex(n => new { n.UserId, n.IsRead }); 
            builder.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            
        }
    }
}