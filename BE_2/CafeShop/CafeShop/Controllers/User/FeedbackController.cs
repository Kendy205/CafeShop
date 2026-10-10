using CafeShop.DTO.Feedback.Requests;
using CafeShop.DTO.Feedback.Responses;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System;
using System.Threading.Tasks;

namespace CafeShop.Controllers.User
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase 
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddFeedback([FromBody] CreateFeedbackRequestDto request)
        {
            try
            {
                int userId = GetUserId();
                var result = await _feedbackService.CreateFeedbackAsync(userId, request);

                if (!result.IsSuccess)
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        StatusCode = 400,
                        Message = result.Message
                    });
                }

                if (result.FeedbackId == null)
                {
                    return StatusCode(500, new ApiResponse<string>
                    {
                        Success = false,
                        StatusCode = 500,
                        Message = "Lỗi hệ thống: Không thể lấy ID của đánh giá sau khi tạo."
                    });
                }

                return Ok(new ApiResponse<int>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = result.Message,
                    Data = result.FeedbackId.Value
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

        [HttpPost("{id}/images")]
        [Authorize]
        public async Task<IActionResult> UploadFeedbackImages(int id, [FromForm] List<IFormFile> files)
        {
            try
            {
                int userId = GetUserId();
                var result = await _feedbackService.UploadFeedbackImagesAsync(userId, id, files);

                if (!result.IsSuccess)
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        StatusCode = 400,
                        Message = result.Message
                    });
                }

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = result.Message,
                    Data = null
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

        [HttpDelete("{id}/images/{imageId}")]
        [Authorize]
        public async Task<IActionResult> DeleteFeedbackImage(int id, int imageId)
        {
            try
            {
                int userId = GetUserId();
                var result = await _feedbackService.DeleteFeedbackImageAsync(userId, id, imageId);

                if (!result.IsSuccess)
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        StatusCode = 400,
                        Message = result.Message
                    });
                }

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = result.Message,
                    Data = null
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

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateFeedback(int id, [FromBody] UpdateFeedbackRequestDto request)
        {
            try
            {
                int userId = GetUserId();
                var result = await _feedbackService.UpdateFeedbackAsync(userId, id, request);

                if (!result.IsSuccess)
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        StatusCode = 400,
                        Message = result.Message
                    });
                }

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = result.Message,
                    Data = null
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

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            try
            {
                int userId = GetUserId();
                var result = await _feedbackService.DeleteFeedbackAsync(userId, id);

                if (!result.IsSuccess)
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        StatusCode = 400,
                        Message = result.Message
                    });
                }

                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = result.Message,
                    Data = null
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

        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetProductFeedbacks(int productId, [FromQuery] FeedbackFilterDto filter)
        {
            try
            {
                var result = await _feedbackService.GetProductFeedbacksAsync(productId, filter);

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

        [HttpGet("product/{productId}/summary")]
        public async Task<IActionResult> GetFeedbackSummary(int productId)
        {
            try
            {
                var summary = await _feedbackService.GetFeedbackSummaryAsync(productId);

                return Ok(new ApiResponse<FeedbackSummaryResponseDto>
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
