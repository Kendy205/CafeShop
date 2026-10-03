using CafeShop.DTO.Feedback;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using CafeShop.Uitls;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = SystemRole.Admin)]
    public class FeedbackController : ControllerBase
    {
        private readonly IAdminFeedbackService _feedbackService;

        public FeedbackController(IAdminFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpGet]
        public async Task<IActionResult> GetFeedbacksForManagement(
            [FromQuery] int? productId = null,
            [FromQuery] int? rating = null,
            [FromQuery] bool? isVisible = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _feedbackService.GetFeedbacksForManagementAsync(productId, rating, isVisible, pageNumber, pageSize);
                return Ok(ApiResponse<PagedResult<AdminFeedbackResponseDto>>.Succeeded(result, 200, "Lấy danh sách đánh giá thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPut("{id:int}/toggle-visibility")]
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
    }
}
