using TourismHub.Domain.Entities;
using TourismHub.Domain.Interfaces;
using TourismHub.Domain.Enums;
using TourismHub.Application.Interfaces.Services;

namespace TourismHub.Application.Services;

public class UserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _userRepository.GetByEmailAsync(email);
    }

       public async Task<List<User>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            return users.ToList(); 
        }

        public async Task<List<User>> GetUsersByRoleAsync(UserRole role)
        {
            var allUsers = await _userRepository.GetAllAsync();
            return allUsers.Where(u => u.Role == role).ToList();
        }
    public async Task CreateUserAsync(User user)
    {

        await _userRepository.AddAsync(user);
    }

    public async Task UpdateUserAsync(User user)
    {
        await _userRepository.UpdateAsync(user);
    }

    public async Task DeleteUserAsync(Guid id)
    {
        await _userRepository.DeleteAsync(id);
    }

    public async Task<bool> UserExistsAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user != null;
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        return user != null;
    }
}