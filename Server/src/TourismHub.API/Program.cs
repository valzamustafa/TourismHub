using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TourismHub.API;
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
try
{
    Console.WriteLine("🚀 Starting TourismHub API...");
    
    var builder = WebApplication.CreateBuilder(args);

    builder.Logging.ClearProviders();
    builder.Logging.AddConsole();
    builder.Logging.AddDebug();
    builder.Logging.SetMinimumLevel(LogLevel.Debug);

    builder.WebHost.UseUrls("http://localhost:5224");

    builder.Services.AddScoped<IActivityRepository, ActivityRepository>();
    builder.Services.AddScoped<IActivityImageRepository, ActivityImageRepository>(); 
     builder.Services.AddHostedService<ActivityStatusUpdaterService>();

    builder.Services.AddScoped<ActivityImageService>();
    builder.Services.AddScoped<ImageUploadService>();
    
    builder.Services.AddScoped<CategoryService>();
    builder.Services.AddScoped<ActivityService>();
    builder.Services.AddScoped<AuthService>();
    builder.Services.AddScoped<TokenService>();
    builder.Services.AddScoped<PasswordHasher>();
    builder.Services.AddScoped<UserService>();
    builder.Services.AddScoped<ISavedActivityService, SavedActivityService>();

    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        });
    
    builder.Services.AddEndpointsApiExplorer();
    
    builder.Services.Configure<IISServerOptions>(options =>
    {
        options.MaxRequestBodySize = 50 * 1024 * 1024; 
    });

    builder.Services.Configure<FormOptions>(options =>
    {
        options.MultipartBodyLengthLimit = 50 * 1024 * 1024; 
        options.ValueLengthLimit = int.MaxValue;
        options.MultipartBoundaryLengthLimit = int.MaxValue;
        options.MultipartHeadersCountLimit = int.MaxValue;
        options.MultipartHeadersLengthLimit = int.MaxValue;
    });

    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo 
        { 
            Title = "TourismHub API", 
            Version = "v1",
            Description = "TourismHub API Documentation"
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

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    Console.WriteLine("📦 Configuring JWT...");

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
            ClockSkew = TimeSpan.Zero
        };
        
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("Token validated successfully");
                return Task.CompletedTask;
            }
        };
    });

    Console.WriteLine("🔧 Adding Infrastructure...");
    builder.Services.AddInfrastructure(builder.Configuration);

    Console.WriteLine("📦 Adding Application Services...");
    builder.Services.AddApplication();

    var app = builder.Build();

    Console.WriteLine("🔄 Configuring Middleware...");
    
    app.UseCors("AllowAll");

    app.UseStaticFiles();

    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TourismHub API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "TourismHub API Documentation";
    });

    app.UseRouting();
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
            await context.Response.WriteAsync("Internal Server Error");
        }
    });

    app.MapControllers();

    app.MapGet("/", () => "TourismHub API is running with PostgreSQL!");
    app.MapGet("/api/health", () => new { 
        status = "Healthy", 
        database = "PostgreSQL",
        timestamp = DateTime.UtcNow 
    });

    Console.WriteLine("🎉 TourismHub API is running on http://localhost:5224");
    Console.WriteLine("📚 Swagger available at http://localhost:5224/swagger");
    Console.WriteLine("📁 File uploads enabled at /uploads/");
    Console.WriteLine("🛑 Press Ctrl+C to stop the application");

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