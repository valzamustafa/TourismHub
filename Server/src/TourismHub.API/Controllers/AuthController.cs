// Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.DTOs.Auth;
using TourismHub.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace TourismHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto registerRequest)
    {
        try
        {
            _logger.LogInformation($"Registration attempt for email: {registerRequest.Email}");
            
            var ipAddress = GetIpAddress();
            var result = await _authService.RegisterAsync(registerRequest, ipAddress);
            
            _logger.LogInformation($"Registration successful for: {registerRequest.Email}");
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Registration failed - Conflict: {ex.Message}");
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error during registration for: {registerRequest.Email}");
            return StatusCode(500, new { 
                message = "Internal server error", 
                error = ex.Message
            });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto loginRequest)
    {
        try
        {
            _logger.LogInformation($"Login attempt for email: {loginRequest.Email}");
            
            var ipAddress = GetIpAddress();
            var result = await _authService.LoginAsync(loginRequest, ipAddress);
            
            _logger.LogInformation($"Login successful for: {loginRequest.Email}");
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning($"Login failed - Unauthorized: {ex.Message}");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error during login for: {loginRequest.Email}");
            return StatusCode(500, new { 
                message = "Internal server error", 
                error = ex.Message
            });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken(RefreshTokenRequestDto refreshRequest)
    {
        try
        {
            _logger.LogInformation("Refresh token attempt");
            
            var ipAddress = GetIpAddress();
            var result = await _authService.RefreshTokenAsync(refreshRequest, ipAddress);
            
            _logger.LogInformation("Refresh token successful");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshTokenRequestDto logoutRequest)
    {
        try
        {
            _logger.LogInformation("Logout attempt");
            
            var ipAddress = GetIpAddress();
            await _authService.LogoutAsync(logoutRequest.RefreshToken, ipAddress);
            
            _logger.LogInformation("Logout successful");
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return BadRequest(new { message = ex.Message });
        }
    }

    private string GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"]!;
        else
            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "unknown";
    }
}