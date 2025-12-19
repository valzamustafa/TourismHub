// API/DependencyInjection.cs
using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;
using TourismHub.Application.Services;
using TourismHub.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TourismHub.Domain.Entities;
using Microsoft.AspNetCore.SignalR;
using TourismHub.API.Hubs;
using TourismHub.Infrastructure.Repositories;

namespace TourismHub.API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
          
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            
            services.AddDbContext<TourismHubDbContext>(options =>
            {
                options.UseNpgsql(connectionString);
                
                if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
                {
                    options.EnableSensitiveDataLogging();
                }
            });


            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IActivityRepository, ActivityRepository>();
            services.AddScoped<IBookingRepository, BookingRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<IReviewRepository, ReviewRepository>();
            services.AddScoped<IActivityImageRepository, ActivityImageRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
            
     
            services.AddScoped<INotificationRepository, NotificationRepository>();

   
            services.AddScoped<UserService>();
            services.AddScoped<ActivityService>();
            services.AddScoped<BookingService>();
            services.AddScoped<PaymentService>();
            services.AddScoped<ReviewService>();
            services.AddScoped<ActivityImageService>();
   
            
  
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();

  
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<NotificationHelper>();
            

            services.AddSignalR();
            

            services.AddCors(options =>
            {
                options.AddPolicy("SignalRPolicy", builder =>
                {
                    builder.WithOrigins("http://localhost:3000", "http://localhost:5173")
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials()
                           .SetPreflightMaxAge(TimeSpan.FromHours(1));
                });
            });

            return services;
        }
    }
}