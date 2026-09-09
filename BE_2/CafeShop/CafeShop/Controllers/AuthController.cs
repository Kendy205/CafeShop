using CafeShop.DTO.Auth;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            try
            {
                await _authService.RegisterAsync(dto);
                return Ok(ApiResponse<string>.Succeeded(null,200, "Đăng ký tài khoản thành công!"));
            }
            catch (ArgumentException ex) // Bắt đúng cái lỗi trùng Username từ Service ném ra
            {
                return BadRequest(ApiResponse<string>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failed($"Lỗi hệ thống: {ex.Message}"));
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            try
            {
                var data = await _authService.LoginAsync(dto);
                return Ok(ApiResponse<AuthResponseDto>.Succeeded(data,200, "Đăng nhập thành công!"));
            }
            catch (UnauthorizedAccessException ex) // Bắt lỗi sai pass / khóa tài khoản
            {
                return Unauthorized(ApiResponse<AuthResponseDto>.Failed(ex.Message, 401));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<AuthResponseDto>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] AuthResponseDto dto)
        {
            try
            {
                var data = await _authService.RefreshTokenAsync(dto);
                return Ok(ApiResponse<AuthResponseDto>.Succeeded(data,200, "Đã cấp lại Token thành công!"));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse<AuthResponseDto>.Failed(ex.Message, 401));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<AuthResponseDto>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }
    }
}
