using TourismHub.Application.DTOs.Auth;
using TourismHub.Domain.Entities;

namespace TourismHub.Application.Interfaces.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    Task<AuthResponseDto> RefreshTokenAsync(string accessToken, string refreshToken, string ipAddress);
    Task RevokeTokenAsync(string refreshToken, string ipAddress);
}