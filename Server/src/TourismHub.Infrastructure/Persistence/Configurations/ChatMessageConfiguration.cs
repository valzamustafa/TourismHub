using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;

namespace TourismHub.Persistence.Configurations
{
    public class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
    {
        public void Configure(EntityTypeBuilder<ChatMessage> builder)
        {
            builder.ToTable("ChatMessages");
            
            builder.HasKey(m => m.Id);
            
            builder.Property(m => m.Content)
                .IsRequired()
                .HasMaxLength(2000);
            
            builder.Property(m => m.IsRead)
                .IsRequired()
                .HasDefaultValue(false);
            
            builder.Property(m => m.SentAt)
                .IsRequired();
            
      
            builder.HasOne(m => m.Chat)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ChatId)
                .OnDelete(DeleteBehavior.Cascade);
   
            builder.HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
          
            builder.HasIndex(m => m.ChatId);
            builder.HasIndex(m => m.SenderId);
            builder.HasIndex(m => m.SentAt);
            builder.HasIndex(m => m.IsRead);
        }
    }
}
