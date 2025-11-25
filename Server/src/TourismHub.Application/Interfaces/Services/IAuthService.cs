using TourismHub.Application.DTOs.Auth;

namespace TourismHub.Application.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto loginRequest, string ipAddress);
    Task LogoutAsync(string refreshToken, string ipAddress);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto refreshRequest, string ipAddress);
}