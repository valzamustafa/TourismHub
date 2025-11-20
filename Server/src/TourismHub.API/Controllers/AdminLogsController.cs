using Microsoft.AspNetCore.Mvc;
using TourismHub.API.DTOs.AdminLogs;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminLogsController : ControllerBase
    {
        private readonly AdminLogService _adminLogService;

        public AdminLogsController(AdminLogService adminLogService)
        {
            _adminLogService = adminLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAdminLogs()
        {
            try
            {
                var logs = await _adminLogService.GetAllLogsAsync();
                var response = logs.Select(log => new AdminLogResponseDto
                {
                    Id = log.Id,
                    AdminId = log.AdminId,
                    Action = log.Action,
                    TargetType = log.TargetType,
                    TargetId = log.TargetId,
                    CreatedAt = log.CreatedAt
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving admin logs", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAdminLogById(Guid id)
        {
            try
            {
                var log = await _adminLogService.GetLogByIdAsync(id);
                
                if (log == null)
                {
                    return NotFound(new { message = $"Admin log with ID {id} not found" });
                }

                var response = new AdminLogResponseDto
                {
                    Id = log.Id,
                    AdminId = log.AdminId,
                    Action = log.Action,
                    TargetType = log.TargetType,
                    TargetId = log.TargetId,
                    CreatedAt = log.CreatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the admin log", error = ex.Message });
            }
        }

        [HttpGet("admin/{adminId}")]
        public async Task<IActionResult> GetAdminLogsByAdminId(Guid adminId)
        {
            try
            {
                var logs = await _adminLogService.GetAdminLogsAsync(adminId);
                var response = logs.Select(log => new AdminLogResponseDto
                {
                    Id = log.Id,
                    AdminId = log.AdminId,
                    Action = log.Action,
                    TargetType = log.TargetType,
                    TargetId = log.TargetId,
                    CreatedAt = log.CreatedAt
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving admin logs", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateAdminLog([FromBody] AdminLogCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var adminLog = new AdminLog
                {
                    Id = Guid.NewGuid(),
                    AdminId = createDto.AdminId,
                    Action = createDto.Action,
                    TargetType = createDto.TargetType,
                    TargetId = createDto.TargetId,
                    CreatedAt = DateTime.UtcNow
                };

                var createdLog = await _adminLogService.CreateLogAsync(adminLog);

                var response = new AdminLogResponseDto
                {
                    Id = createdLog.Id,
                    AdminId = createdLog.AdminId,
                    Action = createdLog.Action,
                    TargetType = createdLog.TargetType,
                    TargetId = createdLog.TargetId,
                    CreatedAt = createdLog.CreatedAt
                };

                return CreatedAtAction(nameof(GetAdminLogById), new { id = response.Id }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the admin log", error = ex.Message });
            }
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> CreateAdminLogs([FromBody] List<AdminLogCreateDto> createDtos)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var adminLogs = createDtos.Select(dto => new AdminLog
                {
                    Id = Guid.NewGuid(),
                    AdminId = dto.AdminId,
                    Action = dto.Action,
                    TargetType = dto.TargetType,
                    TargetId = dto.TargetId,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                var createdLogs = new List<AdminLogResponseDto>();

                foreach (var log in adminLogs)
                {
                    var createdLog = await _adminLogService.CreateLogAsync(log);
                    createdLogs.Add(new AdminLogResponseDto
                    {
                        Id = createdLog.Id,
                        AdminId = createdLog.AdminId,
                        Action = createdLog.Action,
                        TargetType = createdLog.TargetType,
                        TargetId = createdLog.TargetId,
                        CreatedAt = createdLog.CreatedAt
                    });
                }

                return Ok(createdLogs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating admin logs", error = ex.Message });
            }
        }
    }
}