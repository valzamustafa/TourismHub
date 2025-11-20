// Controllers/AdminLogsController.cs
using Microsoft.AspNetCore.Mvc;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Enums;

[ApiController]
[Route("api/[controller]")]
public class AdminLogsController : ControllerBase
{
    private static readonly List<AdminLog> _adminLogs = new();

    [HttpGet]
    public IActionResult GetAdminLogs()
    {
        return Ok(_adminLogs);
    }

    [HttpGet("{id}")]
    public IActionResult GetAdminLog(Guid id)
    {
        var log = _adminLogs.FirstOrDefault(a => a.Id == id);
        if (log == null) return NotFound();
        return Ok(log);
    }

    [HttpPost]
    public IActionResult CreateAdminLog([FromBody] AdminLogCreateDto dto)
    {
        var log = new AdminLog
        {
            Id = Guid.NewGuid(),
            AdminId = dto.AdminId,
            Action = dto.Action,
            TargetType = dto.TargetType,
            TargetId = dto.TargetId,
            CreatedAt = DateTime.UtcNow
        };
        
        _adminLogs.Add(log);
        return CreatedAtAction(nameof(GetAdminLog), new { id = log.Id }, log);
    }
}

public record AdminLogCreateDto(
    Guid AdminId,
    string Action,
    AdminTargetType TargetType,
    Guid TargetId
);