using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;

namespace TourismHub.Infrastructure.Persistence.Configurations
{
    public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
    {
        public void Configure(EntityTypeBuilder<Activity> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Name)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(a => a.Description)
                .IsRequired();

            builder.Property(a => a.Price)
                .HasPrecision(10, 2);

            builder.Property(a => a.AvailableSlots)
                .IsRequired();

            builder.Property(a => a.Location)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(a => a.Category)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(a => a.Status)
                .IsRequired()
                .HasConversion<string>();

      
            builder.HasOne(a => a.Provider)
                .WithMany(u => u.Activities)
                .HasForeignKey(a => a.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
