using TourismHub.Domain.Enums;

namespace TourismHub.API.DTOs.AdminLogs
{
    public class AdminLogCreateDto
    {
        public Guid AdminId { get; set; }
        public string Action { get; set; } = string.Empty;
        public AdminTargetType TargetType { get; set; }
        public Guid TargetId { get; set; }
    }
}