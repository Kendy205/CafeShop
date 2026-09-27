using CafeShop.DTO.News;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly INewsService _newsService;

        public NewsController(INewsService newsService)
        {
            _newsService = newsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPublicNews(
            [FromQuery] string? keyword = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _newsService.GetPublicNewsAsync(keyword, pageNumber, pageSize);
                return Ok(ApiResponse<PagedResult<NewsListResponseDto>>.Succeeded(result, 200, "Lấy danh sách tin tức thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPublicNewsById(int id)
        {
            try
            {
                var result = await _newsService.GetPublicNewsByIdAsync(id);
                return Ok(ApiResponse<NewsResponseDto>.Succeeded(result, 200, "Lấy tin tức thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetPublicNewsBySlug(string slug)
        {
            try
            {
                var result = await _newsService.GetPublicNewsBySlugAsync(slug);
                return Ok(ApiResponse<NewsResponseDto>.Succeeded(result, 200, "Lấy tin tức thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
        }
    }
}
