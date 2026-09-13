using CafeShop.DTO.Feedback;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CafeShop.Controllers.User
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase // Nếu dự án của bạn có BaseController, hãy đổi ControllerBase thành BaseController nhé
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        /// <summary>
        /// Khách hàng gửi đánh giá cho sản phẩm trong một đơn hàng
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddFeedback([FromBody] CreateFeedbackDto request)
        {
            try
            {
                int userId = GetUserId();
                await _feedbackService.AddFeedbackAsync(userId, request);

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Cảm ơn bạn đã gửi đánh giá!",
                    Data = null
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = $"Lỗi hệ thống: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Lấy danh sách đánh giá của 1 sản phẩm (Có phân trang)
        /// Dùng cho màn hình Chi tiết sản phẩm (Ai cũng xem được, không cần đăng nhập)
        /// </summary>
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductFeedbacks(int productId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _feedbackService.GetProductFeedbacksAsync(productId, pageNumber, pageSize);

                return Ok(new ApiResponse<PagedResult<FeedbackResponseDto>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Lấy danh sách đánh giá thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = $"Lỗi hệ thống: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Lấy thống kê số sao và tổng số đánh giá của 1 sản phẩm
        /// </summary>
        [HttpGet("product/{productId}/summary")]
        public async Task<IActionResult> GetFeedbackSummary(int productId)
        {
            try
            {
                var summary = await _feedbackService.GetFeedbackSummaryAsync(productId);

                return Ok(new ApiResponse<FeedbackSummaryDto>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Lấy thống kê đánh giá thành công",
                    Data = summary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = $"Lỗi hệ thống: {ex.Message}"
                });
            }
        }

        // ========================================================
        // HÀM HELPER LẤY USER ID (Giữ lại nếu bạn không dùng BaseController)
        // ========================================================
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
