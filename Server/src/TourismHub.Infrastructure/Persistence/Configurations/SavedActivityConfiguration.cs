using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;

namespace TourismHub.Infrastructure.Persistence.Configurations
{
   public class SavedActivityConfiguration : IEntityTypeConfiguration<SavedActivity>
{
    public void Configure(EntityTypeBuilder<SavedActivity> builder)
    {
        // Tabela
        builder.ToTable("SavedActivities");

        // Primary Key
        builder.HasKey(sa => sa.Id);

        // Properties
        builder.Property(sa => sa.Id)
            .IsRequired()
            .HasDefaultValueSql("uuid_generate_v4()");

        builder.Property(sa => sa.UserId)
            .IsRequired();

        builder.Property(sa => sa.ActivityId)
            .IsRequired();

        builder.Property(sa => sa.SavedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone") 
            .HasDefaultValueSql("NOW()");

        // Relationships
        builder.HasOne(sa => sa.User)
            .WithMany(u => u.SavedActivities)
            .HasForeignKey(sa => sa.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sa => sa.Activity)
            .WithMany(a => a.SavedActivities)
            .HasForeignKey(sa => sa.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(sa => new { sa.UserId, sa.ActivityId })
            .IsUnique()
            .HasDatabaseName("IX_SavedActivities_User_Activity");

        builder.HasIndex(sa => sa.UserId)
            .HasDatabaseName("IX_SavedActivities_UserId");

        builder.HasIndex(sa => sa.ActivityId)
            .HasDatabaseName("IX_SavedActivities_ActivityId");
    }
}
}