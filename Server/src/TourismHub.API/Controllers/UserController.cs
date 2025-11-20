using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.User;
using TourismHub.Domain.Enums;

namespace TourismHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
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

                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving users", error = ex.Message });
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                
                if (user == null)
                {
                    return NotFound(new { message = $"User with ID {id} not found" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the user", error = ex.Message });
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

                var user = new User
                {
                    Id = Guid.NewGuid(),
                    FullName = createDto.FullName,
                    Email = createDto.Email,
                    Password = BCrypt.Net.BCrypt.HashPassword(createDto.Password),
                    Role = createDto.Role,
                    ProfileImage = null, 
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var createdUser = await _userService.CreateUserAsync(user);
                
                return CreatedAtAction(nameof(GetUserById), new { id = createdUser.Id }, createdUser);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the user", error = ex.Message });
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

                return Ok(existingUser);
            }
            catch (Exception ex)
            {
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

                existingUser.Password = BCrypt.Net.BCrypt.HashPassword(passwordDto.NewPassword);
                existingUser.UpdatedAt = DateTime.UtcNow;

                await _userService.UpdateUserAsync(existingUser);

                return Ok(new { message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
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

                return Ok(existingUser);
            }
            catch (Exception ex)
            {
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

                await _userService.DeleteUserAsync(id);

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
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
                return StatusCode(500, new { message = "An error occurred while checking user existence", error = ex.Message });
            }
        }
    }
}