// Controllers/UserController.cs
using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.User;
using TourismHub.Domain.Enums;
using Microsoft.Extensions.Logging;
using System.Globalization; 
using Microsoft.AspNetCore.Authentication;


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

        var userDto = new
        {
            id = user.Id.ToString(),
            fullName = user.FullName, 
            email = user.Email,
            profileImage = user.ProfileImage,
            role = user.Role.ToString(),
            phone = user.Phone ?? "",
            address = user.Address ?? "",
            bio = user.Bio ?? "",
            createdAt = user.CreatedAt,
            isActive = user.IsActive,
            lastLogin = user.LastLogin
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
public async Task<IActionResult> UpdateUser(string id, [FromBody] UserUpdateDto updateDto)
{
    try
    {
       
        if (!Guid.TryParse(id, out Guid userId))
        {
            return BadRequest(new { message = "Invalid user ID format" });
        }

        _logger.LogInformation($"Updating user {id} with data: FullName={updateDto.FullName}, Phone={updateDto.Phone}, Address={updateDto.Address}, Bio={updateDto.Bio}");
        
        if (!ModelState.IsValid)
        {
            _logger.LogWarning($"ModelState invalid: {ModelState}");
            return BadRequest(ModelState);
        }

        var existingUser = await _userService.GetUserByIdAsync(userId);
        if (existingUser == null)
        {
            _logger.LogWarning($"User with ID {id} not found");
            return NotFound(new { message = $"User with ID {id} not found" });
        }

       
        if (!string.IsNullOrEmpty(updateDto.FullName))
            existingUser.FullName = updateDto.FullName;
        
        if (!string.IsNullOrEmpty(updateDto.Phone))
            existingUser.Phone = updateDto.Phone;
        
        if (!string.IsNullOrEmpty(updateDto.Address))
            existingUser.Address = updateDto.Address;
        
        if (!string.IsNullOrEmpty(updateDto.Bio))
            existingUser.Bio = updateDto.Bio;
        
        existingUser.ProfileImage = updateDto.ProfileImage ?? existingUser.ProfileImage;
        existingUser.UpdatedAt = DateTime.UtcNow;

        await _userService.UpdateUserAsync(existingUser);

       
        return Ok(new { 
            message = "User updated successfully",
            user = new {
                id = existingUser.Id.ToString(),
                fullName = existingUser.FullName,
                email = existingUser.Email,
                phone = existingUser.Phone ?? "",
                address = existingUser.Address ?? "",
                bio = existingUser.Bio ?? "",
                profileImage = existingUser.ProfileImage,
                createdAt = existingUser.CreatedAt,
                isActive = existingUser.IsActive
            }
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
[HttpPost("upload-profile")]
public async Task<IActionResult> UploadProfileImage([FromForm] IFormFile file, [FromForm] string userId)
{
    try
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

     
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Invalid file type. Only JPG, JPEG, PNG, and WebP are allowed." });
        }

        if (file.Length > 5 * 1024 * 1024) 
        {
            return BadRequest(new { message = "File size exceeds 5MB limit" });
        }

       
        var fileName = $"{Guid.NewGuid()}{extension}";
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var filePath = Path.Combine(uploadsFolder, fileName);
        
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

       
        var imageUrl = $"/uploads/{fileName}";
        
        if (!Guid.TryParse(userId, out Guid userGuid))
        {
            return BadRequest(new { message = "Invalid user ID" });
        }

      
        var user = await _userService.GetUserByIdAsync(userGuid);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.ProfileImage = imageUrl;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _userService.UpdateUserAsync(user);

        return Ok(new { 
            success = true, 
            imageUrl = imageUrl,
            message = "Profile image uploaded successfully" 
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error uploading profile image");
        return StatusCode(500, new { message = "Error uploading image", error = ex.Message });
    }
}
[HttpPatch("provider/{id}/change-password")]
public async Task<IActionResult> ChangeProviderPassword(Guid id, [FromBody] ProviderChangePasswordDto passwordDto)
{
    try
    {
        _logger.LogInformation($"Changing password for provider with ID {id}");
        
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

     
        if (passwordDto.NewPassword != passwordDto.ConfirmPassword)
        {
            return BadRequest(new { 
                success = false,
                message = "New password and confirmation do not match" 
            });
        }

        var existingUser = await _userService.GetUserByIdAsync(id);
        if (existingUser == null)
        {
            return NotFound(new { 
                success = false,
                message = $"Provider with ID {id} not found" 
            });
        }


        if (existingUser.Role != UserRole.Provider)
        {
            return BadRequest(new { 
                success = false,
                message = "This endpoint is only for providers" 
            });
        }

    
        bool isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(
            passwordDto.CurrentPassword, 
            existingUser.PasswordHash
        );
        
        if (!isCurrentPasswordValid)
        {
            return BadRequest(new { 
                success = false,
                message = "Current password is incorrect" 
            });
        }

     
        if (string.IsNullOrWhiteSpace(passwordDto.NewPassword) || passwordDto.NewPassword.Length < 6)
        {
            return BadRequest(new { 
                success = false,
                message = "New password must be at least 6 characters long" 
            });
        }

       
        bool isSamePassword = BCrypt.Net.BCrypt.Verify(
            passwordDto.NewPassword, 
            existingUser.PasswordHash
        );
        
        if (isSamePassword)
        {
            return BadRequest(new { 
                success = false,
                message = "New password cannot be the same as current password" 
            });
        }

        
        existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordDto.NewPassword);
        existingUser.UpdatedAt = DateTime.UtcNow;

        await _userService.UpdateUserAsync(existingUser);

        _logger.LogInformation($"Password successfully updated for provider {id}");

        return Ok(new { 
            success = true,
            message = "Password updated successfully" 
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error occurred while updating password for provider with ID {id}");
        return StatusCode(500, new { 
            success = false,
            message = "An error occurred while updating the password", 
            error = ex.Message 
        });
    }
}

[HttpGet("provider/{id}/profile")]
public async Task<IActionResult> GetProviderProfile(Guid id)
{
    try
    {
        var user = await _userService.GetUserByIdAsync(id);
        
        if (user == null)
        {
            return NotFound(new { 
                success = false,
                message = $"Provider with ID {id} not found" 
            });
        }

        if (user.Role != UserRole.Provider)
        {
            return BadRequest(new { 
                success = false,
                message = "User is not a provider" 
            });
        }

        var providerProfile = new
        {
            id = user.Id.ToString(),
            fullName = user.FullName,
            email = user.Email,
            profileImage = user.ProfileImage,
            phone = user.Phone ?? "",
            address = user.Address ?? "",
            bio = user.Bio ?? "",
            createdAt = user.CreatedAt,
            lastLogin = user.LastLogin,
            isActive = user.IsActive,
            stats = new {
                activitiesCount = user.Activities?.Count ?? 0
            }
        };

        return Ok(new {
            success = true,
            data = providerProfile
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"Error getting provider profile for ID {id}");
        return StatusCode(500, new { 
            success = false,
            message = "An error occurred while getting provider profile", 
            error = ex.Message 
        });
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