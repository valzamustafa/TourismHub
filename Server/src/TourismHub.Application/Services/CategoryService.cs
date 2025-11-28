// Application/Services/CategoryService.cs
using TourismHub.Domain.Entities;
using TourismHub.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using TourismHub.Infrastructure.Persistence;

namespace TourismHub.Application.Services
{
    public class CategoryService
    {
        private readonly TourismHubDbContext _context;

        public CategoryService(TourismHubDbContext context)
        {
            _context = context;
        }

        public async Task<List<Category>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .Include(c => c.Activities)
                .OrderByDescending(c => c.Featured)
                .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<List<Category>> GetFeaturedCategoriesAsync()
        {
            return await _context.Categories
                .Include(c => c.Activities)
                .Where(c => c.Featured)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Category?> GetCategoryByIdAsync(Guid id)
        {
            return await _context.Categories
                .Include(c => c.Activities)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Category> CreateCategoryAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<Category> UpdateCategoryAsync(Category category)
        {
            category.UpdatedAt = DateTime.UtcNow;
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task DeleteCategoryAsync(Guid id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
        }
    }
}