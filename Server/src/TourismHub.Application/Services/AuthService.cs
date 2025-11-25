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

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IRefreshTokenRepository refreshTokenRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto loginRequest, string ipAddress)
    {
        var user = await _userRepository.GetByEmailAsync(loginRequest.Email);
        if (user == null || !_passwordHasher.VerifyPassword(loginRequest.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated");

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
        await _tokenService.RevokeTokenAsync(refreshToken, ipAddress);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto refreshRequest, string ipAddress)
    {
        return await _tokenService.RefreshTokenAsync(refreshRequest.AccessToken, refreshRequest.RefreshToken, ipAddress);
    }
}