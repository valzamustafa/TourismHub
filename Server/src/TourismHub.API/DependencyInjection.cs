using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;
using TourismHub.Infrastructure.Repositories;
using TourismHub.Application.Services;
using TourismHub.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TourismHub.Domain.Entities;

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

            // Repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IActivityRepository, ActivityRepository>();
            services.AddScoped<IBookingRepository, BookingRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<IReviewRepository, ReviewRepository>();
            services.AddScoped<IActivityImageRepository, ActivityImageRepository>();
            services.AddScoped<IAdminLogRepository, AdminLogRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>(); 

            // Services
            services.AddScoped<UserService>();
            services.AddScoped<ActivityService>();
            services.AddScoped<BookingService>();
            services.AddScoped<PaymentService>();
            services.AddScoped<ReviewService>();
            services.AddScoped<ActivityImageService>();
            services.AddScoped<AdminLogService>();
            
        
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();

            return services;
        }
    }
}