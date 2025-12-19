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

try
{
    var builder = WebApplication.CreateBuilder(args);
    Console.WriteLine("🚀 Starting TourismHub API with Stripe and Notifications...");

    Console.WriteLine("🔧 Configuring Stripe...");
  
    var stripeSecretKey = "sk_test_51SZvQfKCIdvvVhXAfXOzze45MwjiI5ZWAao3j04BmYC5VhGTvspk1ZmhBS8rnJXqWilsSMss3uowU0MD0wumZMrg00uKDJTI6G";
    var stripePublishableKey = "pk_test_51SZvQfKCIdvvVhXAhi8H9VOBq1v5GG73BHBqBeKcx8DAM2NQgAzzWZzSCdrXeHkz7N9Q6nBOAW8q0bcaFsWOhfXV00ARu4owUK";
    

    stripeSecretKey = stripeSecretKey?.Trim()
        .Replace(" ", "")
        .Replace("\t", "")
        .Replace("\n", "")
        .Replace("\r", "") ?? "";

    if (string.IsNullOrEmpty(stripeSecretKey))
    {
        Console.WriteLine("❌ ERROR: Stripe secret key is empty!");
    }
    else if (!stripeSecretKey.StartsWith("sk_test_"))
    {
        Console.WriteLine($"❌ ERROR: Invalid Stripe key. Should start with 'sk_test_'. Found: {stripeSecretKey.Substring(0, Math.Min(10, stripeSecretKey.Length))}...");
    }
    else
    {
       
        StripeConfiguration.ApiKey = stripeSecretKey;
        
        builder.Services.Configure<StripeSettings>(options =>
        {
            options.SecretKey = stripeSecretKey;
            options.PublishableKey = stripePublishableKey;
            options.WebhookSecret = "";
        });
        
        Console.WriteLine("✅ Stripe configured with YOUR NEW STANDARD KEY!");
        Console.WriteLine($"🔑 Secret Key Type: Standard Key");
        Console.WriteLine($"🔑 Secret Key Length: {stripeSecretKey.Length}");
        Console.WriteLine($"🔑 Secret Key (first 30 chars): {stripeSecretKey.Substring(0, Math.Min(30, stripeSecretKey.Length))}...");
        
        if (!string.IsNullOrEmpty(stripePublishableKey) && stripePublishableKey.StartsWith("pk_test_"))
        {
            Console.WriteLine($"🔑 Publishable Key: {stripePublishableKey.Substring(0, Math.Min(30, stripePublishableKey.Length))}...");
        }
        else
        {
            Console.WriteLine("⚠️  WARNING: Publishable key not configured or invalid!");
            Console.WriteLine("Go to Stripe Dashboard -> API keys -> Copy 'Publishable key' from Standard keys table");
        }
    }

    builder.Logging.ClearProviders();
    builder.Logging.AddConsole();
    builder.Logging.AddDebug();
    builder.Logging.SetMinimumLevel(LogLevel.Debug);

    builder.WebHost.UseUrls("http://localhost:5224");


    Console.WriteLine("📦 Configuring Repositories...");
    
    builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
    builder.Services.AddScoped<IActivityImageRepository, ActivityImageRepository>();
    builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
    builder.Services.AddScoped<IBookingRepository, BookingRepository>();
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
    builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
    builder.Services.AddScoped<TourismHub.Domain.Interfaces.INotificationRepository, 
                              TourismHub.Infrastructure.Repositories.NotificationRepository>();
      builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

    Console.WriteLine("⏰ Adding Background Services...");
    builder.Services.AddHostedService<ActivityStatusUpdaterService>();


    Console.WriteLine("🔧 Adding Application Services...");
    
    builder.Services.AddScoped<ActivityImageService>();
    builder.Services.AddScoped<ImageUploadService>();
    builder.Services.AddScoped<CategoryService>();
    builder.Services.AddScoped<ActivityService>();
    builder.Services.AddScoped<IChatService, ChatService>();
    builder.Services.AddScoped<TourismHub.Application.Services.ReviewService>();

    builder.Services.AddScoped<INotificationService, NotificationService>();
    builder.Services.AddScoped<NotificationHelper>();
    
    builder.Services.AddScoped<TourismHub.Application.Interfaces.Services.IPasswordHasher, 
                              TourismHub.Application.Services.PasswordHasher>();
    
    builder.Services.AddScoped<TourismHub.Application.Interfaces.Services.ITokenService, 
                              TourismHub.Application.Services.TokenService>();

    builder.Services.AddScoped<TourismHub.Infrastructure.Services.IEmailService, 
                          TourismHub.Infrastructure.Services.EmailService>();
   
    builder.Services.AddScoped<TourismHub.Application.Interfaces.Services.IAuthService, 
                              TourismHub.Application.Services.AuthService>();
    
    builder.Services.AddScoped<UserService>();
    builder.Services.AddScoped<ISavedActivityService, SavedActivityService>();
    builder.Services.AddScoped<PaymentService>();
    builder.Services.AddScoped<BookingService>();
    builder.Services.AddScoped<StripeWebhookService>();
    

    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
            options.JsonSerializerOptions.WriteIndented = true;
        });
    
    builder.Services.AddEndpointsApiExplorer();

    builder.Services.Configure<KestrelServerOptions>(options =>
    {
        options.Limits.MaxRequestBodySize = 50 * 1024 * 1024; // 50MB
    });

    builder.Services.Configure<FormOptions>(options =>
    {
        options.MultipartBodyLengthLimit = 50 * 1024 * 1024;
        options.ValueLengthLimit = int.MaxValue;
        options.MultipartBoundaryLengthLimit = int.MaxValue;
        options.MultipartHeadersCountLimit = int.MaxValue;
        options.MultipartHeadersLengthLimit = int.MaxValue;
    });


    Console.WriteLine("🔔 Adding SignalR for Real-time Notifications...");
    builder.Services.AddSignalR(options =>
    {
        options.EnableDetailedErrors = true;
        options.MaximumReceiveMessageSize = 102400; // 100KB
        options.KeepAliveInterval = TimeSpan.FromSeconds(15);
        options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
    });

  
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo 
        { 
            Title = "TourismHub API", 
            Version = "v1",
            Description = "TourismHub API Documentation with Stripe Payments and Real-time Notifications"
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


    Console.WriteLine("🔐 Configuring JWT Authentication for WebSockets...");
    
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

  
    
    // Test CORS
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

    // Test Headers
    app.MapGet("/api/test-headers", (HttpContext context) =>
    {
        return Results.Json(new
        {
            success = true,
            message = "Headers test successful",
            receivedHeaders = context.Request.Headers
                .Where(h => h.Key.StartsWith("Cache") || h.Key.StartsWith("Pragma") || h.Key == "Expires")
                .ToDictionary(h => h.Key, h => h.Value.ToString()),
            timestamp = DateTime.UtcNow
        });
    }).AllowAnonymous();


    app.MapGet("/api/test-websocket", async () =>
    {
        return Results.Json(new
        {
            success = true,
            message = "WebSocket endpoint available",
            url = "ws://localhost:5224/notificationHub",
            requiresToken = true,
            timestamp = DateTime.UtcNow,
            testCommand = "Connect with: new WebSocket(`ws://localhost:5224/notificationHub?access_token=YOUR_JWT_TOKEN`)"
        });
    }).AllowAnonymous();

    app.MapPost("/api/test-notification", async (HttpContext context) =>
    {
        try
        {
            var notificationService = context.RequestServices.GetRequiredService<INotificationService>();
            var hubContext = context.RequestServices.GetRequiredService<IHubContext<NotificationHub>>();
            
     
            var userId = context.User.FindFirst("nameid")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                userId = "fafb6bc2-16db-4e66-a1f6-de4ca9c5f829"; 
            }

            Console.WriteLine($"🔔 Sending test notification to user: {userId}");
            
     
            var notification = await notificationService.CreateNotificationAsync(
                Guid.Parse(userId),
                "Test Notification",
                "This is a test notification from the API",
                TourismHub.Domain.Enums.NotificationType.System,
                null
            );

   
            await hubContext.Clients.User(userId)
                .SendAsync("ReceiveNotification", new
                {
                    notification.Id,
                    notification.Title,
                    notification.Message,
                    Type = notification.Type.ToString(),
                    TypeValue = (int)notification.Type,
                    notification.RelatedId,
                    notification.IsRead,
                    notification.CreatedAt,
                    TimeAgo = "Just now"
                });

            return Results.Json(new
            {
                success = true,
                message = "Test notification sent!",
                notificationId = notification.Id,
                userId = userId,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error sending test notification: {ex.Message}");
            return Results.Json(new
            {
                success = false,
                error = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }).AllowAnonymous();


    app.MapPost("/api/test-payment", async (HttpContext context) =>
    {
        try
        {
            Console.WriteLine("🧪 Testing Stripe with your NEW standard key...");
            
            if (string.IsNullOrEmpty(StripeConfiguration.ApiKey))
            {
                await context.Response.WriteAsJsonAsync(new { 
                    success = false,
                    error = "Stripe not configured" 
                });
                return;
            }

            var options = new PaymentIntentCreateOptions
            {
                Amount = 1000, // $10.00
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                Description = "Test payment with your new key"
            };

            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            Console.WriteLine($"✅ SUCCESS! Payment intent created: {paymentIntent.Id}");
            
            await context.Response.WriteAsJsonAsync(new
            {
                success = true,
                clientSecret = paymentIntent.ClientSecret,
                message = "Payment intent created successfully!",
                paymentIntentId = paymentIntent.Id,
                testCard = "Use: 4242 4242 4242 4242",
                keyType = "Standard Key (sk_test_) - FULL ACCESS"
            });
        }
        catch (StripeException ex)
        {
            Console.WriteLine($"❌ Stripe error: {ex.Message}");
            await context.Response.WriteAsJsonAsync(new 
            { 
                success = false,
                error = "Stripe Error",
                message = ex.Message,
                stripeError = ex.StripeError?.Message,
                currentKey = StripeConfiguration.ApiKey?.Substring(0, Math.Min(30, StripeConfiguration.ApiKey?.Length ?? 0)) + "...",
                help = "Check if your new key is activated in Stripe Dashboard"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ General error: {ex.Message}");
            await context.Response.WriteAsJsonAsync(new { 
                success = false,
                error = ex.Message 
            });
        }
    }).AllowAnonymous();

  
    app.MapGet("/test-stripe-now", async () =>
    {
        try
        {
            Console.WriteLine("⚡ Quick test with NEW standard key...");
            
            var options = new PaymentIntentCreateOptions
            {
                Amount = 100, // $1.00
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                Description = "Quick test with new standard key"
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);

            return Results.Json(new
            {
                success = true,
                message = "🎉 YOUR NEW STANDARD KEY WORKS PERFECTLY!",
                paymentIntentId = intent.Id,
                clientSecret = intent.ClientSecret,
                testCard = "4242 4242 4242 4242",
                expiryDate = "Any future date (e.g., 12/34)",
                cvcCode = "Any 3 digits (e.g., 123)",
                zipCode = "Any 5 digits",
                keyType = "Standard Key (sk_test_) - FULL ACCESS",
                nextStep = "Copy clientSecret to frontend and test payment"
            });
        }
        catch (StripeException ex)
        {
            return Results.Json(new
            {
                success = false,
                error = "Stripe Error",
                message = ex.Message,
                details = ex.StripeError?.Message,
                currentKey = StripeConfiguration.ApiKey?.Substring(0, Math.Min(30, StripeConfiguration.ApiKey?.Length ?? 0)) + "...",
                help = "Your new standard key should work. If not, wait a few minutes for Stripe to activate it."
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


    app.MapGet("/test-my-new-key", async () =>
    {
        try
        {
            Console.WriteLine("🔑 Testing YOUR NEW standard key...");
            
            var keyInfo = new
            {
                key = StripeConfiguration.ApiKey?.Substring(0, Math.Min(20, StripeConfiguration.ApiKey?.Length ?? 0)) + "...",
                length = StripeConfiguration.ApiKey?.Length ?? 0,
                isStandard = StripeConfiguration.ApiKey?.StartsWith("sk_") ?? false,
                isTest = StripeConfiguration.ApiKey?.StartsWith("sk_test_") ?? false,
                permissions = "FULL ACCESS (Standard Key)"
            };
            
            Console.WriteLine($"Key Info: {System.Text.Json.JsonSerializer.Serialize(keyInfo)}");
          
            var options = new PaymentIntentCreateOptions
            {
                Amount = 50, // $0.50
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                Description = "Test with your new standard key"
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);
            var balanceService = new BalanceService();
            var balance = await balanceService.GetAsync();

            return Results.Json(new
            {
                success = true,
                message = "✅ YOUR NEW STANDARD KEY WORKS PERFECTLY!",
                paymentIntentId = intent.Id,
                clientSecret = intent.ClientSecret,
                balance = new {
                    livemode = balance.Livemode,
                    environment = balance.Livemode ? "LIVE" : "TEST",
                    available = balance.Available?.FirstOrDefault()?.Amount
                },
                keyType = "Standard Key (sk_test_)",
                permissions = "FULL API ACCESS",
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
                keyType = "Standard Key",
                help = "Wait 1-2 minutes for new key to activate, or create another key",
                fix = "Go to Stripe Dashboard -> API keys -> Create another secret key"
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


    app.MapGet("/api/test-stripe", () =>
    {
        return new
        {
            configured = !string.IsNullOrEmpty(StripeConfiguration.ApiKey),
            keyLength = StripeConfiguration.ApiKey?.Length ?? 0,
            keyPrefix = StripeConfiguration.ApiKey?.Substring(0, Math.Min(20, StripeConfiguration.ApiKey?.Length ?? 0)) + "...",
            environment = StripeConfiguration.ApiKey?.StartsWith("sk_test_") == true ? "TEST (Standard)" : "UNKNOWN",
            keyType = StripeConfiguration.ApiKey?.StartsWith("sk_") == true ? "Standard Key" : "Unknown",
            timestamp = DateTime.UtcNow
        };
    }).AllowAnonymous();


    app.MapPost("/api/payments/simple-test", async () =>
    {
        try
        {
            Console.WriteLine("🧪 Creating simple payment intent with new key...");
            
            var options = new PaymentIntentCreateOptions
            {
                Amount = 1999, 
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                Description = "Simple test payment with new key"
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);

            return Results.Json(new
            {
                success = true,
                clientSecret = intent.ClientSecret,
                paymentIntentId = intent.Id,
                amount = intent.Amount,
                currency = intent.Currency,
                message = "Use this clientSecret with Stripe.js",
                keyStatus = "NEW STANDARD KEY WORKING"
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
                help = "Your new key may need time to activate. Wait 2 minutes and try again."
            });
        }
    }).AllowAnonymous();


    app.MapPost("/api/test-email", async (HttpContext context) =>
    {
        try
        {
            var emailService = context.RequestServices.GetRequiredService<TourismHub.Infrastructure.Services.IEmailService>();
            
            await emailService.SendPasswordResetEmailAsync(
                "test@example.com", 
                "Test User", 
                "test-token-123", 
                "http://localhost:3000");

            await context.Response.WriteAsJsonAsync(new
            {
                success = true,
                message = "Test email sent (check server logs)"
            });
        }
        catch (Exception ex)
        {
            await context.Response.WriteAsJsonAsync(new 
            { 
                success = false,
                error = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }).AllowAnonymous();


    app.Use(async (context, next) =>
    {
        try
        {
            await next();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unhandled exception: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new { 
                success = false,
                error = "Internal Server Error" 
            });
        }
    });

 
    app.MapControllers();
    

    app.MapHub<NotificationHub>("/notificationHub");
    
    app.MapGet("/", () => "TourismHub API is running with PostgreSQL, Stripe, and Real-time Notifications!");
    
    app.MapGet("/api/health", () => new { 
        status = "Healthy", 
        database = "PostgreSQL",
        stripe = "Configured with NEW STANDARD KEY",
        websocket = "SignalR Notifications Enabled",
        email = "Configured for Gmail",
        timestamp = DateTime.UtcNow,
        testUrls = new {
            testNotification = "http://localhost:5224/api/test-notification",
            testWebSocket = "http://localhost:5224/api/test-websocket",
            testNewKey = "http://localhost:5224/test-my-new-key",
            quickTest = "http://localhost:5224/test-stripe-now",
            simpleTest = "http://localhost:5224/api/payments/simple-test",
            testEmail = "http://localhost:5224/api/test-email",
            corsTest = "http://localhost:5224/api/cors-test",
            headersTest = "http://localhost:5224/api/test-headers"
        }
    });

   
    Console.WriteLine("\n" + new string('=', 60));
    Console.WriteLine("🎉 TourismHub API STARTED SUCCESSFULLY!");
    Console.WriteLine(new string('=', 60));
    Console.WriteLine("🌐 URL: http://localhost:5224");
    Console.WriteLine("📚 Swagger: http://localhost:5224/swagger");
    Console.WriteLine("🔔 WebSocket: ws://localhost:5224/notificationHub");
    Console.WriteLine("💰 Stripe: Configured with NEW STANDARD KEY");
    Console.WriteLine("📧 Email: Configured for Gmail");
    Console.WriteLine("\n🔗 Test URLs:");
    Console.WriteLine("  • Test Notifications: http://localhost:5224/api/test-notification");
    Console.WriteLine("  • Test WebSocket: http://localhost:5224/api/test-websocket");
    Console.WriteLine("  • Test CORS: http://localhost:5224/api/cors-test");
    Console.WriteLine("  • Test Your New Key: http://localhost:5224/test-my-new-key");
    Console.WriteLine("  • Test Email: http://localhost:5224/api/test-email");
    Console.WriteLine("\n💳 Test Card: 4242 4242 4242 4242");
    Console.WriteLine("🔐 Token Claim: 'nameid' must contain user ID for WebSocket auth");
    Console.WriteLine("🛑 Press Ctrl+C to stop the application");
    Console.WriteLine(new string('=', 60) + "\n");

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