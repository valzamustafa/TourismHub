using TourismHub.API;
using TourismHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); 

builder.Services.AddInfrastructure(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    using var scope = app.Services.CreateScope();
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<TourismHubDbContext>();
        
        await context.Database.MigrateAsync();
        
        Console.WriteLine("✅ Database migrations applied successfully!");
        Console.WriteLine($"📊 Database: {context.Database.GetDbConnection().Database}");
        Console.WriteLine($"🔗 Data Source: {context.Database.GetDbConnection().DataSource}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database migration failed: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"📝 Inner exception: {ex.InnerException.Message}");
        }
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => "TourismHub API is running with PostgreSQL!");
app.MapGet("/api/health", () => new { 
    status = "Healthy", 
    database = "PostgreSQL",
    timestamp = DateTime.UtcNow 
});

app.Run();