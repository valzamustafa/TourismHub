using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TourismHub.Application.DTOs.Auth;
using TourismHub.Application.Interfaces.Services;
using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;

namespace TourismHub.Application.Services;

public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserRepository _userRepository;

    public TokenService(
        IOptions<JwtSettings> jwtSettings,
        IRefreshTokenRepository refreshTokenRepository,
        IUserRepository userRepository)
    {
        _jwtSettings = jwtSettings.Value;
        _refreshTokenRepository = refreshTokenRepository;
        _userRepository = userRepository;
    }

    public string GenerateAccessToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string accessToken, string refreshToken, string ipAddress)
    {
        var storedRefreshToken = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (storedRefreshToken == null || !storedRefreshToken.IsActive)
            throw new SecurityTokenException("Invalid refresh token");

  
        storedRefreshToken.IsRevoked = true;
        storedRefreshToken.Revoked = DateTime.UtcNow;
        storedRefreshToken.RevokedByIp = ipAddress;
        await _refreshTokenRepository.UpdateAsync(storedRefreshToken);

     
        var user = await _userRepository.GetByIdAsync(storedRefreshToken.UserId);
        if (user == null)
            throw new ArgumentException("User not found");

        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

    
        var newRefreshTokenEntity = new RefreshToken
        {
            Token = newRefreshToken,
            Expires = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            Created = DateTime.UtcNow,
            CreatedByIp = ipAddress,
            UserId = user.Id,
            IsRevoked = false
        };

        await _refreshTokenRepository.CreateAsync(newRefreshTokenEntity);

        return new AuthResponseDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            ProfileImage = user.ProfileImage,
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
        };
    }

    public async Task RevokeTokenAsync(string refreshToken, string ipAddress)
    {
        var storedRefreshToken = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (storedRefreshToken != null && storedRefreshToken.IsActive)
        {
            storedRefreshToken.IsRevoked = true;
            storedRefreshToken.Revoked = DateTime.UtcNow;
            storedRefreshToken.RevokedByIp = ipAddress;
            await _refreshTokenRepository.UpdateAsync(storedRefreshToken);
        }
    }
}