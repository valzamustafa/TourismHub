using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TourismHub.Domain.Entities;

namespace TourismHub.Infrastructure.Persistence.Configurations
{
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.HasKey(b => b.Id);

            builder.Property(b => b.BookingDate)
                .IsRequired();

            builder.Property(b => b.NumberOfPeople)
                .IsRequired();

            builder.Property(b => b.Status)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(b => b.PaymentStatus)
                .IsRequired()
                .HasConversion<string>();

            builder.HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Activity)
                .WithMany(a => a.Bookings)
                .HasForeignKey(b => b.ActivityId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Payment)
                .WithOne(p => p.Booking)
                .HasForeignKey<Payment>(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}