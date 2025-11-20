using TourismHub.Domain.Enums;

namespace TourismHub.API.DTOs.AdminLogs
{
    public class AdminLogResponseDto
    {
        public Guid Id { get; set; }
        public Guid AdminId { get; set; }
        public string Action { get; set; } = string.Empty;
        public AdminTargetType TargetType { get; set; }
        public Guid TargetId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}