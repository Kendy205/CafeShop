using System;
using System.Threading.Tasks;
using CafeShop.DTO.Admin;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    // [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
    public class UserController : ControllerBase
    {
        private readonly IAdminUserService _userService;

        public UserController(IAdminUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] string? searchKeyword = null, 
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _userService.GetAllUsersAsync(searchKeyword, pageNumber, pageSize);
                return Ok(ApiResponse<PagedResult<AdminUserDto>>.Succeeded(result, 200, "Lấy danh sách khách hàng thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                    return NotFound(ApiResponse<object>.Failed("Khách hàng không tồn tại!", 404));

                return Ok(ApiResponse<AdminUserDto>.Succeeded(user, 200, "Lấy chi tiết khách hàng thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPatch("{id:int}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            try
            {
                bool newState = await _userService.ToggleUserStatusAsync(id);
                return Ok(ApiResponse<object>.Succeeded(new { UserId = id, IsActive = newState }, 200, newState ? "Đã mở khóa tài khoản khách hàng!" : "Đã khóa tài khoản khách hàng!"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }
    }
}
