using TourismHub.Domain.Entities;

namespace TourismHub.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<List<User>> GetAllAsync();
        Task<List<User>> GetUsersByRoleAsync(Domain.Enums.UserRole role);
        Task AddAsync(User user);
        void Update(User user);
        void Delete(User user);
        Task<bool> ExistsAsync(Guid id);
        Task SaveChangesAsync();
    }
}
