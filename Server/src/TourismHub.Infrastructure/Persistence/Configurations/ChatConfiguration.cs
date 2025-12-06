using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;

namespace TourismHub.Persistence.Configurations
{
    public class ChatConfiguration : IEntityTypeConfiguration<Chat>
    {
        public void Configure(EntityTypeBuilder<Chat> builder)
        {
            builder.ToTable("Chats");
            
            builder.HasKey(c => c.Id);
            
            builder.Property(c => c.LastMessage)
                .IsRequired()
                .HasMaxLength(500);
            
            builder.Property(c => c.LastMessageAt)
                .IsRequired();
            
            builder.Property(c => c.CreatedAt)
                .IsRequired();
            
            builder.Property(c => c.UpdatedAt)
                .IsRequired();
            
     
            builder.HasOne(c => c.Provider)
                .WithMany()
                .HasForeignKey(c => c.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);
            
       
            builder.HasOne(c => c.Tourist)
                .WithMany()
                .HasForeignKey(c => c.TouristId)
                .OnDelete(DeleteBehavior.Restrict);
            

            builder.HasMany(c => c.Messages)
                .WithOne(m => m.Chat)
                .HasForeignKey(m => m.ChatId)
                .OnDelete(DeleteBehavior.Cascade);
            
         
            builder.HasIndex(c => c.ProviderId);
            builder.HasIndex(c => c.TouristId);
            builder.HasIndex(c => c.LastMessageAt);
            
            
            builder.HasIndex(c => new { c.ProviderId, c.TouristId })
                .IsUnique();
        }
    }
}