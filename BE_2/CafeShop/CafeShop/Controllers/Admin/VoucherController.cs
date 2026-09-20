using System;
using System.Threading.Tasks;
using CafeShop.DTO.Voucher;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    // [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
    public class VoucherController : ControllerBase
    {
        private readonly IAdminVoucherService _voucherService;

        public VoucherController(IAdminVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllVouchers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _voucherService.GetAllVouchersAsync(pageNumber, pageSize);
                return Ok(ApiResponse<PagedResult<VoucherDto>>.Succeeded(result, 200, "Lấy danh sách voucher thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetVoucherById(int id)
        {
            try
            {
                var voucher = await _voucherService.GetVoucherByIdAsync(id);
                if (voucher == null)
                    return NotFound(ApiResponse<object>.Failed("Mã giảm giá không tồn tại!", 404));

                return Ok(ApiResponse<VoucherDto>.Succeeded(voucher, 200, "Lấy chi tiết mã giảm giá thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu tạo mã giảm giá không hợp lệ!", 400));

                var newVoucher = await _voucherService.CreateVoucherAsync(dto);
                return Ok(ApiResponse<VoucherDto>.Succeeded(newVoucher, 201, "Tạo mã giảm giá mới thành công!"));
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

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] UpdateVoucherDto dto)
        {
            try
            {
                var updatedVoucher = await _voucherService.UpdateVoucherAsync(id, dto);
                return Ok(ApiResponse<VoucherDto>.Succeeded(updatedVoucher, 200, "Cập nhật mã giảm giá thành công!"));
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

        [HttpPatch("{id:int}/toggle-active")]
        public async Task<IActionResult> ToggleActiveVoucher(int id)
        {
            try
            {
                bool newState = await _voucherService.ToggleActiveAsync(id);
                return Ok(ApiResponse<object>.Succeeded(new { IsActive = newState }, 200, newState ? "Đã kích hoạt mã giảm giá!" : "Đã tạm dừng mã giảm giá!"));
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

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            try
            {
                await _voucherService.DeleteVoucherAsync(id);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Xóa mã giảm giá thành công!"));
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

        [HttpPost("assign-user")]
        public async Task<IActionResult> AssignVoucherToUser([FromBody] AssignUserVoucherDto dto)
        {
            try
            {
                await _voucherService.AssignVoucherToUserAsync(dto);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Tặng mã giảm giá cho người dùng thành công!"));
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
