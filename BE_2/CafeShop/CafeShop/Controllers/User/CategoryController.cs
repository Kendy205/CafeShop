using System;
using System.Linq;
using System.Threading.Tasks;
using CafeShop.DTO.Admin; // Reusing CategoryDto from Admin since it's simple
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers.User
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllAsync();
                
                var result = categories.Select(c => new CategoryDto
                {
                    CategoryId = c.CategoryId,
                    Name = c.Name ?? string.Empty,
                    Description = c.Description
                }).ToList();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Lấy danh sách danh mục thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            try
            {
                var category = await _categoryService.GetByIdAsync(id);
                if (category == null)
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        StatusCode = 404,
                        Message = "Không tìm thấy danh mục"
                    });

                var result = new CategoryDto
                {
                    CategoryId = category.CategoryId,
                    Name = category.Name ?? string.Empty,
                    Description = category.Description
                };

                return Ok(new ApiResponse<CategoryDto>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Lấy danh mục thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}
