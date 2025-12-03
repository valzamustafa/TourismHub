using TourismHub.Application.DTOs.Auth;
using TourismHub.Application.Interfaces.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace TourismHub.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly TourismHub.Infrastructure.Services.IEmailService _emailService;
    private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IRefreshTokenRepository refreshTokenRepository,
        TourismHub.Infrastructure.Services.IEmailService emailService,
        IPasswordResetTokenRepository passwordResetTokenRepository,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
        _emailService = emailService;
        _passwordResetTokenRepository = passwordResetTokenRepository;
        _logger = logger;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto loginRequest, string ipAddress)
    {
        _logger.LogInformation($"Login attempt for email: {loginRequest.Email}");

        var user = await _userRepository.GetByEmailAsync(loginRequest.Email);
        if (user == null || !_passwordHasher.VerifyPassword(loginRequest.Password, user.PasswordHash))
        {
            _logger.LogWarning($"Login failed - Invalid credentials for: {loginRequest.Email}");
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!user.IsActive)
        {
            _logger.LogWarning($"Login failed - Account deactivated for: {loginRequest.Email}");
            throw new UnauthorizedAccessException("Account is deactivated");
        }

        user.LastLogin = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            Expires = DateTime.UtcNow.AddDays(7),
            Created = DateTime.UtcNow,
            CreatedByIp = ipAddress,
            UserId = user.Id,
            IsRevoked = false
        };

        await _refreshTokenRepository.CreateAsync(refreshTokenEntity);

        _logger.LogInformation($"Login successful for: {loginRequest.Email}");

        return new AuthResponseDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            ProfileImage = user.ProfileImage,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(15),
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto registerRequest, string ipAddress)
    {
        _logger.LogInformation($"Registration attempt for email: {registerRequest.Email}");

        var existingUser = await _userRepository.GetByEmailAsync(registerRequest.Email);
        if (existingUser != null)
        {
            _logger.LogWarning($"Registration failed - Email already exists: {registerRequest.Email}");
            throw new InvalidOperationException("Email is already registered");
        }

   
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = registerRequest.FullName,
            Email = registerRequest.Email,
            PasswordHash = _passwordHasher.HashPassword(registerRequest.Password),
            Role = registerRequest.Role,
            ProfileImage = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _userRepository.AddAsync(user);

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            Expires = DateTime.UtcNow.AddDays(7),
            Created = DateTime.UtcNow,
            CreatedByIp = ipAddress,
            UserId = user.Id,
            IsRevoked = false
        };

        await _refreshTokenRepository.CreateAsync(refreshTokenEntity);

        _logger.LogInformation($"Registration successful for: {registerRequest.Email}");

        return new AuthResponseDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            ProfileImage = user.ProfileImage,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(15),
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
        };
    }
    
  public async Task ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto, string origin)
    {
        _logger.LogInformation($"Forgot password request for email: {forgotPasswordDto.Email}");

        var user = await _userRepository.GetByEmailAsync(forgotPasswordDto.Email);
        if (user == null)
        {
         
            _logger.LogWarning($"Forgot password request for non-existent email: {forgotPasswordDto.Email}");
            return;
        }

        if (!user.IsActive)
        {
            _logger.LogWarning($"Forgot password request for deactivated account: {forgotPasswordDto.Email}");
            return;
        }
        var token = GenerateResetToken();
        
        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = token,
            Expires = DateTime.UtcNow.AddHours(24),
            Created = DateTime.UtcNow,
            IsUsed = false
        };

        var existingToken = await _passwordResetTokenRepository.GetByUserIdAsync(user.Id);
        if (existingToken != null)
        {
            await _passwordResetTokenRepository.DeleteAsync(existingToken.Id);
        }

        await _passwordResetTokenRepository.AddAsync(resetToken);

        await _emailService.SendPasswordResetEmailAsync(user.Email, user.FullName, token, origin);

        _logger.LogInformation($"Password reset token generated for: {forgotPasswordDto.Email}");
    }

    public async Task ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {
        _logger.LogInformation("Password reset attempt");

        if (resetPasswordDto.NewPassword != resetPasswordDto.ConfirmPassword)
        {
            throw new InvalidOperationException("Passwords do not match");
        }
        var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(resetPasswordDto.Token);
        if (resetToken == null)
        {
            throw new InvalidOperationException("Invalid reset token");
        }
        if (resetToken.Expires < DateTime.UtcNow)
        {
            throw new InvalidOperationException("Reset token has expired");
        }
        if (resetToken.IsUsed)
        {
            throw new InvalidOperationException("Reset token has already been used");
        }

        var user = await _userRepository.GetByIdAsync(resetToken.UserId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (!user.IsActive)
        {
            throw new InvalidOperationException("Account is deactivated");
        }

        user.PasswordHash = _passwordHasher.HashPassword(resetPasswordDto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        resetToken.IsUsed = true;
        resetToken.UsedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _passwordResetTokenRepository.UpdateAsync(resetToken);

        _logger.LogInformation($"Password reset successful for user: {user.Email}");
    }

    private string GenerateResetToken()
    {
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }

    public async Task LogoutAsync(string refreshToken, string ipAddress)
    {
        _logger.LogInformation($"Logout attempt from IP: {ipAddress}");
        await _tokenService.RevokeTokenAsync(refreshToken, ipAddress);
        _logger.LogInformation("Logout successful");
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto refreshRequest, string ipAddress)
    {
        _logger.LogInformation("Refresh token attempt");
        var result = await _tokenService.RefreshTokenAsync(refreshRequest.AccessToken, refreshRequest.RefreshToken, ipAddress);
        _logger.LogInformation("Refresh token successful");
        return result;
    }
}