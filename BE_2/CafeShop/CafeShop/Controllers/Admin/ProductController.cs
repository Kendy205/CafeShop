using CafeShop.DTO.Admin;
using CafeShop.DTO.Product;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

using CafeShop.Service.IService.Admin;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
    public class ProductController : ControllerBase
    {
        private readonly IAdminProductService _productService;

        public ProductController(IAdminProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _productService.GetAllAsync(keyword, categoryId, minPrice, maxPrice, sortBy, pageNumber, pageSize);
                return Ok(ApiResponse<PagedResult<ProductResponseDto>>.Succeeded(result, 200, "Lấy danh sách sản phẩm thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _productService.GetByIdAsync(id);
                if (result == null)
                    return NotFound(ApiResponse<object>.Failed("Không tìm thấy sản phẩm", 404));

                return Ok(ApiResponse<ProductResponseDto>.Succeeded(result, 200, "Lấy chi tiết sản phẩm thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateUpdateProductDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var result = await _productService.CreateProductAsync(request);
                return Ok(ApiResponse<ProductResponseDto>.Succeeded(result, 201, "Thêm sản phẩm thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromForm] CreateUpdateProductDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var result = await _productService.UpdateProductAsync(id, request);
                return Ok(ApiResponse<ProductResponseDto>.Succeeded(result, 200, "Cập nhật sản phẩm thành công"));
            }
            catch (ArgumentException ex)
            {
                return NotFound(ApiResponse<object>.Failed(ex.Message, 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpPatch("{id:int}/toggle-availability")]
        public async Task<IActionResult> ToggleAvailability(int id)
        {
            try
            {
                await _productService.ToggleAvailabilityAsync(id);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Cập nhật trạng thái thành công"));
            }
            catch (ArgumentException ex)
            {
                return NotFound(ApiResponse<object>.Failed(ex.Message, 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _productService.DeleteAsync(id);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Xóa sản phẩm thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }
    }
}
