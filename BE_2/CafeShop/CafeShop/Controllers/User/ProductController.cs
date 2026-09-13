using CafeShop.DTO.Product;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers.User
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;


        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        // ==============================================================
        // API LẤY DANH SÁCH SẢN PHẨM CÓ PHÂN TRANG
        // Khớp với link: /api/Product?pageNumber=1&pageSize=8
        // ==============================================================
        [HttpGet]
        public async Task<IActionResult> GetAllProducts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 8)
        {
            try
            {
                // Gọi Service xử lý phân trang
                var result = await _productService.GetAllAsync(null, pageNumber, pageSize);

                // Trả về format chuẩn ApiResponse bọc lấy PagedResult
                return Ok(ApiResponse<PagedResult<ProductResponseDto>>.Succeeded(result, 200, "Lấy danh sách sản phẩm thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        // 2. Lấy chi tiết một đồ uống theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy đồ uống này!" });
            }

            return Ok(ApiResponse<ProductResponseDto>.Succeeded(product,200));
        }

        
    }
}
