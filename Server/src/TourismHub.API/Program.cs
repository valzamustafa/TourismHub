using System.Text;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TourismHub.API;
using TourismHub.API.Models;
using TourismHub.Application;
using TourismHub.Domain.Entities;
using TourismHub.Infrastructure;
using TourismHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TourismHub.Application.Services;
using TourismHub.Application.Services.BackgroundServices;
using TourismHub.Infrastructure.Persistence.Seeders;
using TourismHub.Domain.Interfaces;
using TourismHub.Infrastructure.Repositories;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Stripe;
using Microsoft.AspNetCore.Authorization;
using TourismHub.Application.Interfaces.Services; 
using TourismHub.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using TourismHub.Application.DTOs.Auth;
using TourismHub.Application.Interfaces;
using TourismHub.API.Hubs;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

try
{
    var builder = WebApplication.CreateBuilder(args);
    Console.WriteLine("🚀 Starting TourismHub API with Automated Stripe Key Management...");

    Console.WriteLine("🔧 Configuring Stripe...");
  
    var stripeSecretKey = "sk_test_51SZvQfKCIdvvVhXAfXOzze45MwjiI5ZWAao3j04BmYC5VhGTvspk1ZmhBS8rnJXqWilsSMss3uowU0MD0wumZMrg00uKDJTI6G";
    var stripePublishableKey = "pk_test_51SZvQfKCIdvvVhXAhi8H9VOBq1v5GG73BHBqBeKcx8DAM2NQgAzzWZzSCdrXeHkz7N9Q6nBOAW8q0bcaFsWOhfXV00ARu4owUK";
    
    // Configure logging
    builder.Logging.ClearProviders();
    builder.Logging.AddConsole();
    builder.Logging.AddDebug();
    builder.Logging.SetMinimumLevel(LogLevel.Debug);

    builder.WebHost.UseUrls("http://localhost:5224");

    builder.Services.AddMemoryCache();
    builder.Services.AddHttpClient();

    var stripeConfig = builder.Configuration.GetSection("Stripe");
    var stripeSecretKey = stripeConfig["SecretKey"] ?? "";
    var stripePublishableKey = stripeConfig["PublishableKey"] ?? "";
    
    
    stripeSecretKey = stripeSecretKey?.Trim()
        .Replace(" ", "")
        .Replace("\t", "")
        .Replace("\n", "")
        .Replace("\r", "") ?? "";

    // Configure Stripe settings
    builder.Services.Configure<StripeSettings>(options =>
    {
        options.SecretKey = stripeSecretKey;
        options.PublishableKey = stripePublishableKey;
        options.WebhookSecret = stripeConfig["WebhookSecret"] ?? "";
    });

    // Initialize Stripe with the initial key
    if (!string.IsNullOrEmpty(stripeSecretKey) && stripeSecretKey.StartsWith("sk_"))
    {
        StripeConfiguration.ApiKey = stripeSecretKey;
        Console.WriteLine($"✅ Initial Stripe key configured: {stripeSecretKey.Substring(0, Math.Min(20, stripeSecretKey.Length))}...");
    }

    Console.WriteLine("📦 Configuring Repositories...");
    
    // Add repositories
    builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
    builder.Services.AddScoped<IActivityImageRepository, ActivityImageRepository>();
    builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
    builder.Services.AddScoped<IBookingRepository, BookingRepository>();
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
    builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
    builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
    builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
    builder.Services.AddScoped<IStripeKeyRepository, StripeKeyRepository>();

    Console.WriteLine("⏰ Adding Background Services...");
    builder.Services.AddHostedService<ActivityStatusUpdaterService>();
    builder.Services.AddHostedService<StripeKeyRotationService>();


Console.WriteLine("🔧 Adding Application Services...");

builder.Services.AddScoped<ActivityImageService>();
builder.Services.AddScoped<ImageUploadService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<ActivityService>();
builder.Services.AddScoped<IChatService, ChatService>();

builder.Services.AddScoped<TourismHub.Application.Services.ReviewService>();


builder.Services.AddScoped<KeyManagementService>();
builder.Services.AddScoped<TourismHub.Application.Services.IPaymentService, TourismHub.Application.Services.PaymentService>();


builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<NotificationHelper>();
builder.Services.AddScoped<IPasswordHasher, TourismHub.Application.Services.PasswordHasher>();


builder.Services.AddScoped<ITokenService, TourismHub.Application.Services.TokenService>();


builder.Services.AddScoped<TourismHub.Infrastructure.Services.IEmailService, TourismHub.Infrastructure.Services.EmailService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ISavedActivityService, SavedActivityService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<StripeWebhookService>();

    // Configure controllers
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            options.JsonSerializerOptions.WriteIndented = true;
        });
    
    builder.Services.AddEndpointsApiExplorer();

    // Configure request limits
    builder.Services.Configure<KestrelServerOptions>(options =>
    {
        options.Limits.MaxRequestBodySize = 50 * 1024 * 1024;
    });

    builder.Services.Configure<FormOptions>(options =>
    {
        options.MultipartBodyLengthLimit = 50 * 1024 * 1024;
        options.ValueLengthLimit = int.MaxValue;
        options.MultipartBoundaryLengthLimit = int.MaxValue;
        options.MultipartHeadersCountLimit = int.MaxValue;
        options.MultipartHeadersLengthLimit = int.MaxValue;
    });

    // Configure SignalR
    Console.WriteLine("🔔 Adding SignalR for Real-time Notifications...");
    builder.Services.AddSignalR(options =>
    {
        options.EnableDetailedErrors = true;
        options.MaximumReceiveMessageSize = 102400;
        options.KeepAliveInterval = TimeSpan.FromSeconds(15);
        options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
    });

    // Configure Swagger
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo 
        { 
            Title = "TourismHub API", 
            Version = "v1",
            Description = "TourismHub API Documentation with Automated Stripe Key Management"
        });
        
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });
        
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[] {}
            }
        });
    });

    // Configure CORS
    Console.WriteLine("🌐 Configuring CORS...");
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:5173", 
                    "http://localhost:5174")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .SetPreflightMaxAge(TimeSpan.FromHours(1));
        });
        
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    // Configure JWT Authentication
    Console.WriteLine("🔐 Configuring JWT Authentication...");
    
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    builder.Services.Configure<JwtSettings>(jwtSettings);

    var secret = jwtSettings["Secret"];
    if (string.IsNullOrEmpty(secret) || secret.Length < 32)
    {
        throw new InvalidOperationException("JWT Secret must be at least 32 characters long");
    }

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            NameClaimType = "nameid",
            RoleClaimType = "role"
        };
        
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
                {
                    Console.WriteLine($"🔑 WebSocket token received for path: {path}");
                    context.Token = accessToken;
                }
                
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"🔒 Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine($"✅ Token validated for user: {context.Principal?.Identity?.Name}");
                return Task.CompletedTask;
            }
        };
    });

    builder.Services.AddHttpContextAccessor();

 
    Console.WriteLine("🔧 Adding Infrastructure...");
    builder.Services.AddInfrastructure(builder.Configuration);

    Console.WriteLine("📦 Adding Application Services...");
    builder.Services.AddApplication();

   
    var app = builder.Build();
    Console.WriteLine("🔄 Configuring Middleware...");

    // Configure middleware pipeline
    app.Use(async (context, next) =>
    {
        if (context.Request.Method == "OPTIONS")
        {
            context.Response.Headers.Append("Access-Control-Allow-Origin", context.Request.Headers["Origin"]);
            context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
            context.Response.Headers.Append("Access-Control-Allow-Headers", 
                "Content-Type, Authorization, X-Requested-With, Origin, Accept, Expires, Pragma, Cache-Control, X-CSRF-TOKEN, Access-Control-Allow-Headers");
            context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
            context.Response.Headers.Append("Access-Control-Max-Age", "86400");
            context.Response.Headers.Append("Access-Control-Expose-Headers", "*");
            context.Response.StatusCode = 200;
            await context.Response.CompleteAsync();
            return;
        }
        
        await next();
    });

    app.UseStaticFiles();

    // Configure Swagger UI
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TourismHub API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "TourismHub API Documentation";
    });

    app.UseRouting();
    
    app.UseCors("AllowFrontend");
    
    app.UseAuthentication();
    app.UseAuthorization();

   
    Console.WriteLine("🗄️ Applying database migrations...");
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var context = scope.ServiceProvider.GetRequiredService<TourismHubDbContext>();
            await context.Database.MigrateAsync();
            Console.WriteLine("✅ Database migrations applied successfully!");

           
            var adminSeedService = new AdminSeedService(context);
            await adminSeedService.SeedAdminAsync();

            var stripeKeyRepo = scope.ServiceProvider.GetRequiredService<IStripeKeyRepository>();
            var existingKeys = await stripeKeyRepo.GetAllKeysAsync();
            if (!existingKeys.Any())
            {
                var stripeSettings = scope.ServiceProvider.GetRequiredService<IOptions<StripeSettings>>().Value;
                
                if (!string.IsNullOrEmpty(stripeSettings.SecretKey))
                {
                    var initialKey = new StripeApiKey
                    {
                        Id = Guid.NewGuid(),
                        SecretKey = stripeSettings.SecretKey,
                        PublishableKey = stripeSettings.PublishableKey,
                        KeyId = $"initial_{DateTime.UtcNow:yyyyMMddHHmmss}",
                        Environment = stripeSettings.SecretKey.Contains("_live_") ? "live" : "test",
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddDays(90),
                        IsActive = true,
                        Description = "Initial configuration key",
                        CreatedBy = "System",
                        UsageCount = 0
                    };
                    
                    await stripeKeyRepo.AddKeyAsync(initialKey);
                    Console.WriteLine($"✅ Initial Stripe key seeded: {initialKey.KeyId}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Database migration failed: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
        }
    }

   
    var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
    if (!Directory.Exists(webRootPath))
    {
        Directory.CreateDirectory(webRootPath);
        Console.WriteLine($"✅ Created wwwroot directory: {webRootPath}");
    }

    var uploadsPath = Path.Combine(webRootPath, "uploads", "activity-images");
    if (!Directory.Exists(uploadsPath))
    {
        Directory.CreateDirectory(uploadsPath);
        Console.WriteLine($"✅ Created uploads directory: {uploadsPath}");
    }

    // Test endpoints
    app.MapGet("/api/cors-test", (HttpContext context) =>
    {
        return Results.Json(new
        {
            message = "✅ CORS is working correctly!",
            timestamp = DateTime.UtcNow,
            allowedOrigins = new[] { "http://localhost:3000", "http://localhost:5173" },
            corsConfigured = true,
            headers = context.Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString()),
            method = context.Request.Method
        });
    }).AllowAnonymous();

   
    app.MapGet("/api/stripe-key-status", async (HttpContext context) =>
    {
        try
        {
            var keyService = context.RequestServices.GetRequiredService<KeyManagementService>();
            var keys = await keyService.GetOrCreateValidKeysAsync();
            
            return Results.Json(new
            {
                success = true,
                keyStatus = new
                {
                    keyId = keys.KeyId,
                    environment = keys.Environment,
                    expiresAt = keys.ExpiresAt,
                    daysRemaining = (keys.ExpiresAt - DateTime.UtcNow).Days,
                    isValid = keyService.IsKeyValid(keys.SecretKey),
                    isExpiringSoon = keyService.IsKeyExpiringSoon(keys),
                    description = keys.Description,
                    publishableKey = keys.PublishableKey
                },
                currentApiKey = StripeConfiguration.ApiKey?.Substring(0, Math.Min(20, StripeConfiguration.ApiKey?.Length ?? 0)) + "...",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return Results.Json(new
            {
                success = false,
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }).AllowAnonymous();

   
    app.MapGet("/test-managed-stripe", async () =>
    {
        try
        {
            Console.WriteLine("⚡ Testing Stripe with managed key system...");
            
            var options = new PaymentIntentCreateOptions
            {
                Amount = 100, // $1.00
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                Description = "Test with managed key system"
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);
            var balanceService = new BalanceService();
            var balance = await balanceService.GetAsync();

            return Results.Json(new
            {
                success = true,
                message = "✅ MANAGED KEY SYSTEM WORKS PERFECTLY!",
                paymentIntentId = intent.Id,
                clientSecret = intent.ClientSecret,
                balance = new {
                    livemode = balance.Livemode,
                    environment = balance.Livemode ? "LIVE" : "TEST",
                    available = balance.Available?.FirstOrDefault()?.Amount
                },
                keyManagement = "Automatic key rotation enabled",
                nextStep = "The system will automatically handle key expiration",
                timestamp = DateTime.UtcNow
            });
        }
        catch (StripeException ex)
        {
            return Results.Json(new
            {
                success = false,
                error = "Stripe Error",
                message = ex.Message,
                stripeError = ex.StripeError?.Message,
                help = "The key management system will automatically rotate keys when they expire",
                keyRotationStatus = "Background service running"
            });
        }
        catch (Exception ex)
        {
            return Results.Json(new
            {
                success = false,
                error = "General Error",
                message = ex.Message
            });
        }
    }).AllowAnonymous();

    // Map controllers and hubs
    app.MapControllers();
    app.MapHub<NotificationHub>("/notificationHub");
    
    app.MapGet("/", () => "TourismHub API is running with Automated Stripe Key Management!");
    
    app.MapGet("/api/health", async (HttpContext context) =>
    {
        try
        {
            var keyService = context.RequestServices.GetService<KeyManagementService>();
            var stripeHealth = keyService != null ? 
                await keyService.GetOrCreateValidKeysAsync() : null;
            
            return Results.Json(new { 
                status = "Healthy", 
                database = "PostgreSQL",
                stripe = stripeHealth != null ? "Managed Key System Active" : "Not Configured",
                websocket = "SignalR Notifications Enabled",
                email = "Configured for Gmail",
                timestamp = DateTime.UtcNow,
                stripeKeyInfo = stripeHealth != null ? new
                {
                    keyId = stripeHealth.KeyId,
                    environment = stripeHealth.Environment,
                    expiresInDays = (stripeHealth.ExpiresAt - DateTime.UtcNow).Days,
                    description = stripeHealth.Description
                } : null,
                services = new {
                    keyRotation = "Background service running",
                    automaticManagement = "Enabled",
                    cache = "MemoryCache active"
                }
            });
        }
        catch (Exception ex)
        {
            return Results.Json(new
            {
                status = "Degraded",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    });

   
    Console.WriteLine("\n" + new string('=', 70));
    Console.WriteLine("🎉 TourismHub API STARTED WITH AUTOMATED STRIPE KEY MANAGEMENT!");
    Console.WriteLine(new string('=', 70));
    Console.WriteLine("🌐 URL: http://localhost:5224");
    Console.WriteLine("📚 Swagger: http://localhost:5224/swagger");
    Console.WriteLine("🔔 WebSocket: ws://localhost:5224/notificationHub");
    Console.WriteLine("💰 Stripe: Automated Key Management System Active");
    Console.WriteLine("🔄 Key Rotation: Every 6 hours (checks for expiration)");
    Console.WriteLine("📧 Email: Configured for Gmail");
    Console.WriteLine("\n🔗 Management Endpoints:");
    Console.WriteLine("  • Key Status: http://localhost:5224/api/stripe-key-status");
    Console.WriteLine("  • Test Managed System: http://localhost:5224/test-managed-stripe");
    Console.WriteLine("  • Admin Key Management: http://localhost:5224/api/admin/stripe-keys/current");
    Console.WriteLine("  • Health Check: http://localhost:5224/api/health");
    Console.WriteLine("\n💳 Test Card: 4242 4242 4242 4242");
    Console.WriteLine("⚠️  System will automatically handle key expiration!");
    Console.WriteLine("🛑 Press Ctrl+C to stop the application");
    Console.WriteLine(new string('=', 70) + "\n");

    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"💥 FATAL ERROR: {ex.Message}");
    Console.WriteLine($"📝 Stack trace: {ex.StackTrace}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"🔍 Inner exception: {ex.InnerException.Message}");
        Console.WriteLine($"🔍 Inner stack trace: {ex.InnerException.StackTrace}");
    }
    Console.WriteLine("❌ Application terminated due to error");

}