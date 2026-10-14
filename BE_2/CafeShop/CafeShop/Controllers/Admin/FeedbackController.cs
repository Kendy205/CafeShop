using CafeShop.DTO.Feedback.Requests;
using CafeShop.DTO.Feedback.Responses;
using CafeShop.Filters;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using CafeShop.Uitls;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = $"{SystemRole.Admin},{SystemRole.Staff}")]
    public class FeedbackController : ControllerBase
    {
        private readonly IAdminFeedbackService _feedbackService;

        public FeedbackController(IAdminFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpGet]
        [HasPermission(SystemPermissions.FeedbackModerate)]
        public async Task<IActionResult> GetFeedbacksForManagement([FromQuery] AdminFeedbackFilterDto filter)
        {
            try
            {
                var result = await _feedbackService.GetFeedbacksForManagementAsync(filter);
                return Ok(ApiResponse<PagedResult<AdminFeedbackResponseDto>>.Succeeded(result, 200, "Lấy danh sách đánh giá thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("{id:int}")]
        [HasPermission(SystemPermissions.FeedbackModerate)]
        public async Task<IActionResult> GetFeedbackDetail(int id)
        {
            try
            {
                var result = await _feedbackService.GetFeedbackDetailAsync(id);
                if (result == null)
                    return NotFound(ApiResponse<object>.Failed("Không tìm thấy đánh giá", 404));

                return Ok(ApiResponse<AdminFeedbackDetailResponseDto>.Succeeded(result, 200, "Lấy chi tiết đánh giá thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPut("{id:int}/toggle-visibility")]
        [HasPermission(SystemPermissions.FeedbackModerate)]
        public async Task<IActionResult> ToggleVisibility(int id)
        {
            try
            {
                await _feedbackService.ToggleFeedbackVisibilityAsync(id);
                return Ok(ApiResponse<string>.Succeeded("", 200, "Thay đổi trạng thái hiển thị thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = SystemRole.Admin)]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            try
            {
                await _feedbackService.DeleteFeedbackAsync(id);
                return Ok(ApiResponse<string>.Succeeded("", 200, "Xóa đánh giá thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
        }

        [HttpPost("{id:int}/reply")]
        [HttpPut("{id:int}/reply")]
        [HasPermission(SystemPermissions.FeedbackModerate)]
        public async Task<IActionResult> ReplyToFeedback(int id, [FromBody] AdminReplyRequestDto request)
        {
            try
            {
                int adminUserId = GetUserId();
                await _feedbackService.ReplyToFeedbackAsync(adminUserId, id, request.ReplyContent);
                return Ok(ApiResponse<string>.Succeeded("", 200, "Phản hồi đánh giá thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
        }

        [HttpDelete("{id:int}/reply")]
        [HasPermission(SystemPermissions.FeedbackModerate)]
        public async Task<IActionResult> DeleteReply(int id)
        {
            try
            {
                int adminUserId = GetUserId();
                await _feedbackService.DeleteReplyAsync(adminUserId, id);
                return Ok(ApiResponse<string>.Succeeded("", 200, "Xóa phản hồi thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Bạn chưa đăng nhập hoặc phiên đăng nhập không hợp lệ.");
        }
    }
}
