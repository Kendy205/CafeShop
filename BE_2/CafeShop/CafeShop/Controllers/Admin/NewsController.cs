using CafeShop.DTO.News.Requests;
using CafeShop.DTO.News.Responses;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using CafeShop.Uitls;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = SystemRole.Admin)]
    public class NewsController : ControllerBase
    {
        private readonly IAdminNewsService _newsService;

        public NewsController(IAdminNewsService newsService)
        {
            _newsService = newsService;
        }

        private int GetUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out int userId)) return userId;
            throw new UnauthorizedAccessException("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!");
        }

        [HttpGet]
        public async Task<IActionResult> GetNewsForManagement(
            [FromQuery] string? keyword = null,
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _newsService.GetNewsForManagementAsync(keyword, status, pageNumber, pageSize);
                return Ok(ApiResponse<PagedResult<NewsListResponseDto>>.Succeeded(result, 200, "Lấy danh sách tin tức thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetManagementNewsById(int id)
        {
            try
            {
                var result = await _newsService.GetManagementNewsByIdAsync(id);
                return Ok(ApiResponse<NewsResponseDto>.Succeeded(result, 200, "Lấy tin tức thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateNews([FromForm] CreateNewsRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var result = await _newsService.CreateNewsAsync(GetUserId(), request);
                return Ok(ApiResponse<NewsResponseDto>.Succeeded(result, 201, "Tạo bản nháp thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateNews(int id, [FromForm] UpdateNewsRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var result = await _newsService.UpdateNewsAsync(id, request);
                return Ok(ApiResponse<NewsResponseDto>.Succeeded(result, 200, "Cập nhật bài viết thành công"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ApiResponse<object>.Failed(ex.Message, 403));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteNews(int id)
        {
            try
            {
                await _newsService.DeleteNewsAsync(id);
                return Ok(ApiResponse<string>.Succeeded("", 200, "Xóa bài viết thành công"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ApiResponse<object>.Failed(ex.Message, 403));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
        }

    }
}

