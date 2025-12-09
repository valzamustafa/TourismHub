using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;

namespace TourismHub.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.FullName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(100);

       
        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.Role)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(u => u.ProfileImage)
            .HasMaxLength(500);
            builder.Property(u => u.Phone)
            .HasMaxLength(20) 
            .IsRequired(false);

        builder.Property(u => u.Address)
            .HasMaxLength(500) 
            .IsRequired(false);

        builder.Property(u => u.Bio)
            .HasMaxLength(2000) 
            .IsRequired(false);

        builder.Property(u => u.CreatedAt)
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .IsRequired();

        builder.Property(u => u.IsActive)
            .IsRequired();

        builder.Property(u => u.LastLogin)
            .IsRequired(false);
            builder.HasMany(u => u.Notifications)
                .WithOne(n => n.User)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(u => u.Email)
            .IsUnique();
    }
}