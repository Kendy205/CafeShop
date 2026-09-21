using CafeShop.DTO.Admin;
using CafeShop.DTO.Product;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
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

        // GET /api/Product?keyword=&categoryId=&minPrice=&maxPrice=&sortBy=&minRating=&pageNumber=1&pageSize=8
        [HttpGet]
        public async Task<IActionResult> GetAllProducts(
            [FromQuery] string? keyword = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] int? minRating = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 8)
        {
            try
            {
                var result = await _productService.GetAllAsync(keyword, categoryId, minPrice, maxPrice, sortBy, minRating, pageNumber, pageSize);
                return Ok(ApiResponse<PagedResult<ProductResponseDto>>.Succeeded(result, 200, "Lay danh sach san pham thanh cong"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        // GET /api/Product/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var product = await _productService.GetByIdAsync(id);
                if (product == null)
                    return NotFound(ApiResponse<object>.Failed("Khong tim thay san pham", 404));

                return Ok(ApiResponse<ProductResponseDto>.Succeeded(product, 200, "Lay chi tiet san pham thanh cong"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        // GET /api/Product/categories  -- Public endpoint, khong can dang nhap
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var pagedResult = await _productService.GetAllAsync(null, null, null, null, null, null, 1, 200);
                var categories = pagedResult.Items
                    .Where(p => !string.IsNullOrEmpty(p.CategoryName))
                    .GroupBy(p => new { p.CategoryId, p.CategoryName })
                    .Select(g => new CategoryDto
                    {
                        CategoryId = g.Key.CategoryId,
                        Name = g.Key.CategoryName ?? string.Empty
                    })
                    .OrderBy(c => c.Name)
                    .ToList();

                return Ok(ApiResponse<List<CategoryDto>>.Succeeded(categories, 200, "Lay danh muc thanh cong"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        // GET /api/Product/suggestions
        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions()
        {
            try
            {
                var suggestions = await _productService.GetSearchSuggestionsAsync();
                return Ok(ApiResponse<SearchSuggestionDto>.Succeeded(suggestions, 200, "Lay goi y tim kiem thanh cong"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        // GET /api/Product/autocomplete?keyword=xxx
        [HttpGet("autocomplete")]
        public async Task<IActionResult> GetAutocomplete([FromQuery] string keyword)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(keyword))
                    return Ok(ApiResponse<IEnumerable<ProductAutocompleteDto>>.Succeeded(new List<ProductAutocompleteDto>(), 200, ""));
                
                var results = await _productService.GetAutocompleteSuggestionsAsync(keyword);
                return Ok(ApiResponse<IEnumerable<ProductAutocompleteDto>>.Succeeded(results, 200, "Lay goi y autocomplete thanh cong"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }
    }
}