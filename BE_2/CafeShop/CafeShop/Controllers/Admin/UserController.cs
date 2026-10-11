using System;
using System.Threading.Tasks;
using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;
using CafeShop.DTO.Product.Requests;
using CafeShop.DTO.Product.Responses;
using CafeShop.DTO.User;
using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard.Requests;
using CafeShop.DTO.Dashboard.Responses;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
    public class UserController : ControllerBase
    {
        private readonly IAdminUserService _userService;

        public UserController(IAdminUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] string? keyword = null, 
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _userService.GetAllUsersAsync(keyword, pageNumber, pageSize);
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
            var currentUserIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(currentUserIdStr, out int currentUserId) && currentUserId == id)
            {
                return BadRequest(ApiResponse<object>.Failed("Bạn không thể tự khóa tài khoản của chính mình!", 400));
            }

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

        [HttpPost]
        [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
        public async Task<IActionResult> CreateUser([FromBody] CreateAdminUserDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ!", 400, ModelState));

            try
            {
                var result = await _userService.CreateUserAsync(request);
                return Ok(ApiResponse<AdminUserDto>.Succeeded(result, 201, "Tạo mới tài khoản thành công!"));
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

        [HttpPut("{id:int}")]
        [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateAdminUserDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ!", 400, ModelState));

            try
            {
                var result = await _userService.UpdateUserAsync(id, request);
                return Ok(ApiResponse<AdminUserDto>.Succeeded(result, 200, "Cập nhật thông tin tài khoản thành công!"));
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

        [HttpPost("{id:int}/roles")]
        [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
        public async Task<IActionResult> AssignRoles(int id, [FromBody] AssignRolesRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ!", 400, ModelState));

            var currentUserIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(currentUserIdStr, out int currentUserId) && currentUserId == id)
            {
                return BadRequest(ApiResponse<object>.Failed("Bạn không thể tự thay đổi quyền của chính mình!", 400));
            }

            try
            {
                await _userService.AssignRolesAsync(id, request.RoleIds);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Cập nhật quyền thành công!"));
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
