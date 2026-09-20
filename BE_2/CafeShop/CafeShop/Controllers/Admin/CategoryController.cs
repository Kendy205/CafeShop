using CafeShop.DTO.Admin;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CafeShop.Service.IService.Admin;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)] 
    public class CategoryController : ControllerBase
    {
        private readonly IAdminCategoryService _categoryService;

        public CategoryController(IAdminCategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
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

                return Ok(ApiResponse<List<CategoryDto>>.Succeeded(result, 200, "Lấy danh sách danh mục thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var category = await _categoryService.GetByIdAsync(id);
                if (category == null)
                    return NotFound(ApiResponse<object>.Failed("Không tìm thấy danh mục", 404));

                var result = new CategoryDto
                {
                    CategoryId = category.CategoryId,
                    Name = category.Name ?? string.Empty,
                    Description = category.Description
                };

                return Ok(ApiResponse<CategoryDto>.Succeeded(result, 200, "Lấy danh mục thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                await _categoryService.AddAsync(dto);

                return Ok(ApiResponse<object>.Succeeded(null, 201, "Thêm danh mục thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var category = await _categoryService.UpdateAsync(id, dto);
                if (category == null)
                    return NotFound(ApiResponse<object>.Failed("Không tìm thấy danh mục", 404));

                return Ok(ApiResponse<object>.Succeeded(null, 200, "Cập nhật danh mục thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var category = await _categoryService.GetByIdAsync(id);
                if (category == null)
                    return NotFound(ApiResponse<object>.Failed("Không tìm thấy danh mục", 404));

                // TODO: Nên kiểm tra xem danh mục có đang chứa sản phẩm không trước khi xóa
                await _categoryService.DeleteAsync(id);

                return Ok(ApiResponse<object>.Succeeded(null, 200, "Xóa danh mục thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }
    }
}
