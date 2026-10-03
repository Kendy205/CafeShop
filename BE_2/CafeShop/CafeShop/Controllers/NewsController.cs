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
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _newsService.GetPublicNewsAsync(keyword, page, pageSize);
                return Ok(ApiResponse<PagedResult<NewsListResponseDto>>.Succeeded(result, 200, "Lấy danh sách tin tức thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestNews([FromQuery] int take = 5)
        {
            try
            {
                var result = await _newsService.GetLatestNewsAsync(take);
                return Ok(ApiResponse<System.Collections.Generic.List<NewsListResponseDto>>.Succeeded(result, 200, "Lấy tin tức mới nhất thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetPublicNewsBySlug(string slug)
        {
            try
            {
                var result = await _newsService.GetPublicNewsBySlugAsync(slug);
                return Ok(ApiResponse<NewsResponseDto>.Succeeded(result, 200, "Lấy chi tiết tin tức thành công"));
            }
            catch (Exception ex)
            {
                return NotFound(ApiResponse<object>.Failed(ex.Message, 404));
            }
        }

        [HttpPost("{id:int}/view")]
        public async Task<IActionResult> IncrementViewCount(int id)
        {
            try
            {
                // Determine client identifier: user id from claims, otherwise IP address
                string clientId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                                  ?? HttpContext.Connection.RemoteIpAddress?.ToString() 
                                  ?? "unknown";

                await _newsService.IncrementViewCountAsync(id, clientId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }
    }
}
