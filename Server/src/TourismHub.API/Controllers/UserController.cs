// Controllers/UserController.cs
using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.User;
using TourismHub.Domain.Enums;
using Microsoft.Extensions.Logging;
using System.Globalization; 
namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(UserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

[HttpGet]
public async Task<IActionResult> GetAllUsers([FromQuery] UserRole? role = null)
{
    try
    {
        List<User> users;
        
        if (role.HasValue)
        {
            users = await _userService.GetUsersByRoleAsync(role.Value);
        }
        else
        {
            users = await _userService.GetAllUsersAsync();
        }

        var userDtos = users.Select(u => new UserListDto
        {
            Id = u.Id.ToString(),
            Name = u.FullName,
            Email = u.Email,
            Role = u.Role.ToString(),
            JoinDate = u.CreatedAt.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            Status = u.IsActive ? "Active" : "Inactive"
        }).ToList();

        return Ok(userDtos);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error occurred while retrieving users");
        return StatusCode(500, new { message = "An error occurred while retrieving users", error = ex.Message });
    }
}

        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            try
            {
                var user = await _userService.GetUserByEmailAsync(email);
                
                if (user == null)
                {
                    return NotFound(new { message = $"User with email {email} not found" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while retrieving user with email {email}");
                return StatusCode(500, new { message = "An error occurred while retrieving the user", error = ex.Message });
            }
        }

        [HttpGet("role/{role}")]
        public async Task<IActionResult> GetUsersByRole(UserRole role)
        {
            try
            {
                var users = await _userService.GetUsersByRoleAsync(role);
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while retrieving users with role {role}");
                return StatusCode(500, new { message = "An error occurred while retrieving users", error = ex.Message });
            }
        }

  [HttpPost]
public async Task<IActionResult> CreateUser([FromBody] UserCreateDto createDto)
{
    try
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingUser = await _userService.GetUserByEmailAsync(createDto.Email);
        if (existingUser != null)
        {
            return Conflict(new { message = "Email is already in use" });
        }

        if (!Enum.TryParse<UserRole>(createDto.Role, out UserRole userRole))
        {
            return BadRequest(new { message = "Invalid role specified" });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = createDto.FullName,
            Email = createDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(createDto.Password),
            Role = userRole, 
            ProfileImage = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _userService.CreateUserAsync(user);
        
        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, new { 
            message = "User created successfully",
            user = new {
                user.Id,
                user.FullName,
                user.Email,
                user.Role,
                user.CreatedAt
            }
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error occurred while creating user: {createDto.Email}");
        return StatusCode(500, new { message = "An error occurred while creating the user", error = ex.Message });
    }
}

[HttpGet("{id}")]
public async Task<IActionResult> GetUserById(string id)
{
    try
    {
        if (!Guid.TryParse(id, out Guid userId))
        {
            return BadRequest(new { message = "Invalid user ID format" });
        }

        var user = await _userService.GetUserByIdAsync(userId);
        
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        var userDto = new UserListDto
        {
            Id = user.Id.ToString(),
            Name = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            JoinDate = user.CreatedAt.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            Status = user.IsActive ? "Active" : "Inactive"
        };

        return Ok(userDto);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error occurred while retrieving user with ID {id}");
        return StatusCode(500, new { message = "An error occurred while retrieving the user", error = ex.Message });
    }
}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                if (!string.IsNullOrEmpty(updateDto.FullName))
                {
                    existingUser.FullName = updateDto.FullName;
                }

                existingUser.ProfileImage = updateDto.ProfileImage;
                existingUser.UpdatedAt = DateTime.UtcNow;

                await _userService.UpdateUserAsync(existingUser);

                return Ok(new { 
                    message = "User updated successfully",
                    user = existingUser 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while updating user with ID {id}");
                return StatusCode(500, new { message = "An error occurred while updating the user", error = ex.Message });
            }
        }

        [HttpPatch("{id}/password")]
        public async Task<IActionResult> UpdatePassword(Guid id, [FromBody] UpdatePasswordDto passwordDto)
        {
            try
            {
                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordDto.NewPassword);
                existingUser.UpdatedAt = DateTime.UtcNow;

                await _userService.UpdateUserAsync(existingUser);

                return Ok(new { message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while updating password for user with ID {id}");
                return StatusCode(500, new { message = "An error occurred while updating the password", error = ex.Message });
            }
        }

        [HttpPatch("{id}/role")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleDto roleDto)
        {
            try
            {
                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                existingUser.Role = roleDto.Role;
                existingUser.UpdatedAt = DateTime.UtcNow;

                await _userService.UpdateUserAsync(existingUser);

                return Ok(new { 
                    message = "User role updated successfully",
                    user = existingUser 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while updating role for user with ID {id}");
                return StatusCode(500, new { message = "An error occurred while updating the user role", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                if (existingUser.Role == UserRole.Admin)
                {
                    return BadRequest(new { message = "Cannot delete admin users" });
                }

                await _userService.DeleteUserAsync(id);

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while deleting user with ID {id}");
                return StatusCode(500, new { message = "An error occurred while deleting the user", error = ex.Message });
            }
        }

        [HttpGet("{id}/exists")]
        public async Task<IActionResult> CheckUserExists(Guid id)
        {
            try
            {
                var exists = await _userService.UserExistsAsync(id);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while checking existence for user with ID {id}");
                return StatusCode(500, new { message = "An error occurred while checking user existence", error = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UpdateUserStatusDto statusDto)
        {
            try
            {
                var existingUser = await _userService.GetUserByIdAsync(id);
                if (existingUser == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                existingUser.IsActive = statusDto.IsActive;
                existingUser.UpdatedAt = DateTime.UtcNow;

                await _userService.UpdateUserAsync(existingUser);

                return Ok(new { 
                    message = $"User {(statusDto.IsActive ? "activated" : "deactivated")} successfully",
                    user = existingUser 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while updating status for user with ID {id}");
                return StatusCode(500, new { message = "An error occurred while updating user status", error = ex.Message });
            }
        }
    }
}

public class UpdateUserStatusDto
{
    public bool IsActive { get; set; }
}