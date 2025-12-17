// Controllers/CategoriesController.cs
using Microsoft.AspNetCore.Mvc;
using TourismHub.Application.Services;
using TourismHub.Domain.Entities;
using TourismHub.Application.DTOs.Category;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _categoryService;

    public CategoriesController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllCategories()
    {
        try
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            var result = categories.Select(c => new CategoryViewDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                Featured = c.Featured,
                ActivityCount = c.Activities?.Count ?? 0
            });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving categories", error = ex.Message });
        }
    }

    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedCategories()
    {
        try
        {
            var categories = await _categoryService.GetFeaturedCategoriesAsync();
            var result = categories.Select(c => new CategoryViewDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                Featured = c.Featured,
                ActivityCount = c.Activities?.Count ?? 0
            });
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving featured categories", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDto createDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = createDto.Name,
                Description = createDto.Description,
                ImageUrl = createDto.ImageUrl,
                Featured = createDto.Featured,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createdCategory = await _categoryService.CreateCategoryAsync(category);
            return Ok(new CategoryViewDto
            {
                Id = createdCategory.Id,
                Name = createdCategory.Name,
                Description = createdCategory.Description,
                ImageUrl = createdCategory.ImageUrl,
                Featured = createdCategory.Featured,
                ActivityCount = 0
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the category", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryUpdateDto updateDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingCategory = await _categoryService.GetCategoryByIdAsync(id);
            if (existingCategory == null)
                return NotFound(new { message = "Category not found" });

            existingCategory.Name = updateDto.Name;
            existingCategory.Description = updateDto.Description;
            existingCategory.ImageUrl = updateDto.ImageUrl;
            existingCategory.Featured = updateDto.Featured;
            existingCategory.UpdatedAt = DateTime.UtcNow;

            await _categoryService.UpdateCategoryAsync(existingCategory);
            return Ok(new CategoryViewDto
            {
                Id = existingCategory.Id,
                Name = existingCategory.Name,
                Description = existingCategory.Description,
                ImageUrl = existingCategory.ImageUrl,
                Featured = existingCategory.Featured,
                ActivityCount = existingCategory.Activities?.Count ?? 0
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the category", error = ex.Message });
        }
    }

  [HttpDelete("{id}")]
public async Task<IActionResult> DeleteCategory(Guid id)
{
    try
    {
        var existingCategory = await _categoryService.GetCategoryByIdAsync(id);
        if (existingCategory == null)
            return NotFound(new { message = "Category not found" });
        if (existingCategory.Activities != null && existingCategory.Activities.Any())
        {
            return BadRequest(new { 
                message = "Cannot delete category that has associated activities. Please reassign or delete the activities first." 
            });
        }

        await _categoryService.DeleteCategoryAsync(id);
        return Ok(new { message = "Category deleted successfully" });
    }
    catch (DbUpdateException dbEx)
    {
        return StatusCode(500, new { 
            message = "Database error occurred", 
            error = dbEx.InnerException?.Message ?? dbEx.Message 
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { 
            message = "An error occurred while deleting the category", 
            error = ex.Message 
        });
    }
}
}