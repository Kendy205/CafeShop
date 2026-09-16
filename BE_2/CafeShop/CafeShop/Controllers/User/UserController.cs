using CafeShop.DTO.User;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CafeShop.Controllers.User
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // ==========================================
        // HÀM HELPER: Lấy UserId từ Token
        // ==========================================
        private int GetUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!");
        }

        // ==========================================
        // 1. API LẤY THÔNG TIN HỒ SƠ
        // ==========================================
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                int userId = GetUserId();
                var profile = await _userService.GetProfileAsync(userId);

                return Ok(new ApiResponse<UserProfileDto>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Lấy thông tin thành công!",
                    Data = profile
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, StatusCode = 400, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // ==========================================
        // 2. API CẬP NHẬT THÔNG TIN & AVATAR
        // ==========================================
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto request)
        {
            try
            {
                int userId = GetUserId();
                var updatedProfile = await _userService.UpdateProfileAsync(userId, request);

                return Ok(new ApiResponse<UserProfileDto>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Cập nhật hồ sơ thành công!",
                    Data = updatedProfile
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, StatusCode = 400, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // ==========================================
        // 3. API ĐỔI MẬT KHẨU
        // ==========================================
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
        {
            try
            {
                int userId = GetUserId();
                await _userService.ChangePasswordAsync(userId, request);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập sau."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, StatusCode = 400, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}
