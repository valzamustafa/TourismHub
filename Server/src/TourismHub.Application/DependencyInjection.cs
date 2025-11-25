using Microsoft.Extensions.DependencyInjection;
using TourismHub.Application.Interfaces.Services;
using TourismHub.Application.Services;

namespace TourismHub.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {

        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

   
        services.AddScoped<UserService>();
        services.AddScoped<ActivityService>();
        services.AddScoped<BookingService>();
        services.AddScoped<PaymentService>();
        services.AddScoped<ReviewService>();
        services.AddScoped<ActivityImageService>();
        services.AddScoped<AdminLogService>();

        return services;
    }
}