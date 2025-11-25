using TourismHub.Application.DTOs.Auth;
using TourismHub.Application.Interfaces.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace TourismHub.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IRefreshTokenRepository refreshTokenRepository,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
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