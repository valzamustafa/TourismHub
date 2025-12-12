// TourismHub.Application.Services.BackgroundServices.ActivityStatusUpdaterService.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using TourismHub.Domain.Enums;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services.BackgroundServices
{
    public class ActivityStatusUpdaterService : BackgroundService
    {
        private readonly ILogger<ActivityStatusUpdaterService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public ActivityStatusUpdaterService(
            ILogger<ActivityStatusUpdaterService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Activity Status Updater Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var activityRepository = scope.ServiceProvider
                            .GetRequiredService<IActivityRepository>();

                        var activities = await activityRepository.GetAllAsync();
                        var now = DateTime.UtcNow;

                        foreach (var activity in activities)
                        {
                          
                            if (activity.Status == ActivityStatus.Cancelled || 
                                activity.Status == ActivityStatus.Expired ||
                                activity.Status == ActivityStatus.Delayed) 
                            {
                                continue;
                            }

                            if (activity.EndDate < now)
                            {
                                activity.Status = ActivityStatus.Expired;
                                activity.UpdatedAt = now;
                                await activityRepository.UpdateAsync(activity);
                                _logger.LogInformation($"Activity {activity.Id} marked as expired.");
                            }
                        
                            else if (activity.StartDate <= now && activity.EndDate >= now && 
                                     activity.Status != ActivityStatus.Active)
                            {
                                activity.Status = ActivityStatus.Active;
                                activity.UpdatedAt = now;
                                await activityRepository.UpdateAsync(activity);
                                _logger.LogInformation($"Activity {activity.Id} marked as active.");
                            }
                          
                            else if (activity.StartDate > now && 
                                     activity.Status != ActivityStatus.Pending)
                            {
                                activity.Status = ActivityStatus.Pending;
                                activity.UpdatedAt = now;
                                await activityRepository.UpdateAsync(activity);
                                _logger.LogInformation($"Activity {activity.Id} marked as pending (upcoming).");
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating activity statuses.");
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }

            _logger.LogInformation("Activity Status Updater Service is stopping.");
        }
    }
}