using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;

namespace TourismHub.Infrastructure.Persistence.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Amount)
                .HasPrecision(10, 2)
                .IsRequired();

            builder.Property(p => p.PaymentMethod)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(p => p.PaymentStatus)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(p => p.TransactionId)
                .HasMaxLength(255);
        }
    }
}