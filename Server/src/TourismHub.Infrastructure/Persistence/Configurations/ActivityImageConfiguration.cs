using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;

namespace TourismHub.Infrastructure.Persistence.Configurations
{
    public class ActivityImageConfiguration : IEntityTypeConfiguration<ActivityImage>
    {
        public void Configure(EntityTypeBuilder<ActivityImage> builder)
        {
            builder.HasKey(ai => ai.Id);

            builder.Property(ai => ai.ImageUrl)
                .IsRequired();

      
            builder.HasOne(ai => ai.Activity)
                .WithMany(a => a.Images)
                .HasForeignKey(ai => ai.ActivityId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
