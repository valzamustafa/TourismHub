using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;

namespace TourismHub.Infrastructure.Persistence.Configurations
{
    public class AdminLogConfiguration : IEntityTypeConfiguration<AdminLog>
    {
        public void Configure(EntityTypeBuilder<AdminLog> builder)
        {
            builder.HasKey(al => al.Id);

            builder.Property(al => al.Action)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(al => al.TargetType)
                .IsRequired()
                .HasConversion<string>();

            builder.HasOne(al => al.Admin)
                .WithMany()
                .HasForeignKey(al => al.AdminId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}