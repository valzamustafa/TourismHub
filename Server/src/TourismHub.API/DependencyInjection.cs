using Microsoft.EntityFrameworkCore;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Persistence;
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

      
            services.AddScoped<IUserRepository, TourismHub.Infrastructure.Repositories.UserRepository>();
            services.AddScoped<IActivityRepository, TourismHub.Infrastructure.Repositories.ActivityRepository>();
            services.AddScoped<IBookingRepository, TourismHub.Infrastructure.Repositories.BookingRepository>();
            services.AddScoped<IPaymentRepository, TourismHub.Infrastructure.Repositories.PaymentRepository>();
            services.AddScoped<IReviewRepository, TourismHub.Infrastructure.Repositories.ReviewRepository>();
            services.AddScoped<IActivityImageRepository, TourismHub.Infrastructure.Repositories.ActivityImageRepository>();
            services.AddScoped<IAdminLogRepository, TourismHub.Infrastructure.Repositories.AdminLogRepository>();
            services.AddScoped<IRefreshTokenRepository, TourismHub.Infrastructure.Repositories.RefreshTokenRepository>(); 

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