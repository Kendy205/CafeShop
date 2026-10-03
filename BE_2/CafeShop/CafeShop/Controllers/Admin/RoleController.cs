using System;
using System.Threading.Tasks;
using CafeShop.DTO.Role;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
    public class RoleController : ControllerBase
    {
        private readonly IAdminRoleService _roleService;

        public RoleController(IAdminRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet("permissions")]
        public async Task<IActionResult> GetAllPermissions()
        {
            try
            {
                var result = await _roleService.GetAllPermissionsAsync();
                return Ok(ApiResponse<object>.Succeeded(result, 200, "Lấy danh sách quyền hệ thống thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRoles()
        {
            try
            {
                var result = await _roleService.GetAllRolesAsync();
                return Ok(ApiResponse<object>.Succeeded(result, 200, "Lấy danh sách vai trò thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetRoleById(int id)
        {
            try
            {
                var role = await _roleService.GetRoleByIdAsync(id);
                if (role == null)
                    return NotFound(ApiResponse<object>.Failed("Vai trò không tồn tại!", 404));

                return Ok(ApiResponse<RoleDto>.Succeeded(role, 200, "Lấy chi tiết vai trò thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] RoleRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ!", 400, ModelState));

            try
            {
                var result = await _roleService.CreateRoleAsync(request);
                return Ok(ApiResponse<RoleDto>.Succeeded(result, 201, "Tạo mới vai trò thành công!"));
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
        public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ!", 400, ModelState));

            try
            {
                var result = await _roleService.UpdateRoleAsync(id, request);
                return Ok(ApiResponse<RoleDto>.Succeeded(result, 200, "Cập nhật vai trò thành công!"));
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

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            try
            {
                await _roleService.DeleteRoleAsync(id);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Xóa vai trò thành công!"));
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
