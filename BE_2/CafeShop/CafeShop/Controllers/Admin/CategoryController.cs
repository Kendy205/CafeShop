using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;
using CafeShop.Filters;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using CafeShop.Uitls;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = $"{SystemRole.Admin},{SystemRole.Staff}")] 
    public class CategoryController : ControllerBase
    {
        private readonly IAdminCategoryService _categoryService;

        public CategoryController(IAdminCategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        [HasPermission(SystemPermissions.ProductView)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var categories = await _categoryService.GetAllAsync();
                return Ok(ApiResponse<List<CategoryDto>>.Succeeded(categories, 200, "Lấy danh sách danh mục thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("{id:int}")]
        [HasPermission(SystemPermissions.ProductView)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var category = await _categoryService.GetByIdAsync(id);
                if (category == null)
                    return NotFound(ApiResponse<object>.Failed("Không tìm thấy danh mục", 404));

                return Ok(ApiResponse<CategoryDto>.Succeeded(category, 200, "Lấy danh mục thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [HasPermission(SystemPermissions.ProductCreate)]
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
        [HasPermission(SystemPermissions.ProductEdit)]
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
        [HasPermission(SystemPermissions.ProductDelete)]
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
