using System.Security.Claims;
using CafeShop.DTO.Order;
using CafeShop.DTO.Voucher;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers.User
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VoucherController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        // =========================================================================
        // PHẦN 1: DÀNH CHO KHÁCH HÀNG (CLIENT / USER)
        // =========================================================================

        /// <summary>
        /// Lấy tất cả voucher khả dụng cho user hiện tại (Gồm Voucher Public + Voucher Tặng riêng)
        /// </summary>
        [HttpGet("available")]
        [Authorize]
        public async Task<IActionResult> GetAvailableVouchers()
        {
            try
            {
                int userId = GetUserId();
                var vouchers = await _voucherService.GetAvailableVouchersAsync(userId);
                return Ok(new ApiResponse<List<VoucherDto>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Lấy danh sách mã giảm giá khả dụng thành công!",
                    Data = vouchers
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new ApiResponse<object> { Success = false, StatusCode = 401, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        /// <summary>
        /// Xem trước và tính thử tiền giảm (Không tiêu thụ lượt dùng, áp dụng cả Cart & BuyNow)
        /// </summary>
        [HttpPost("check")]
        [Authorize]
        public async Task<IActionResult> CheckVoucher([FromBody] CheckVoucherRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.VoucherCode))
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        StatusCode = 400,
                        Message = "Mã giảm giá không được để trống!"
                    });

                int userId = GetUserId();
                var result = await _voucherService.CheckVoucherAsync(userId, request);

                return Ok(new ApiResponse<VoucherResponseDto>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Áp dụng mã giảm giá thành công!",
                    Data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new ApiResponse<object> { Success = false, StatusCode = 401, Message = ex.Message });
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

        // =========================================================================
        // PHẦN 2: DÀNH CHO QUẢN TRỊ VIÊN (ADMIN CRUD & GÁN VOUCHER)
        // =========================================================================

        /// <summary>
        /// Admin: Lấy danh sách toàn bộ voucher trong hệ thống (Hỗ trợ phân trang)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllVouchers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _voucherService.GetAllVouchersAsync(pageNumber, pageSize);
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Lấy danh sách voucher thành công!",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        /// <summary>
        /// Admin: Xem chi tiết 1 voucher theo Id
        /// </summary>
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetVoucherById(int id)
        {
            try
            {
                var voucher = await _voucherService.GetVoucherByIdAsync(id);
                if (voucher == null)
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        StatusCode = 404,
                        Message = "Không tìm thấy mã giảm giá!"
                    });

                return Ok(new ApiResponse<VoucherDto>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Lấy chi tiết mã giảm giá thành công!",
                    Data = voucher
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        /// <summary>
        /// Admin: Tạo mới một mã giảm giá (Public hoặc Personal)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        StatusCode = 400,
                        Message = "Dữ liệu tạo mã giảm giá không hợp lệ!"
                    });

                var createdVoucher = await _voucherService.CreateVoucherAsync(dto);
                return CreatedAtAction(nameof(GetVoucherById), new { id = createdVoucher.VoucherId }, new ApiResponse<VoucherDto>
                {
                    Success = true,
                    StatusCode = 201,
                    Message = "Tạo mã giảm giá thành công!",
                    Data = createdVoucher
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

        /// <summary>
        /// Admin: Cập nhật thông tin voucher
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] UpdateVoucherDto dto)
        {
            try
            {
                var updatedVoucher = await _voucherService.UpdateVoucherAsync(id, dto);
                return Ok(new ApiResponse<VoucherDto>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Cập nhật mã giảm giá thành công!",
                    Data = updatedVoucher
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

        /// <summary>
        /// Admin: Bật / Tắt trạng thái mã ngay lập tức (IsActive)
        /// </summary>
        [HttpPatch("{id:int}/toggle-active")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleActiveVoucher(int id)
        {
            try
            {
                bool newState = await _voucherService.ToggleActiveAsync(id);
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = newState ? "Đã kích hoạt mã giảm giá!" : "Đã tạm dừng mã giảm giá!",
                    Data = new { VoucherId = id, IsActive = newState }
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

        /// <summary>
        /// Admin: Xóa mã giảm giá
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            try
            {
                await _voucherService.DeleteVoucherAsync(id);
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Xóa mã giảm giá thành công!"
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

        /// <summary>
        /// Admin: Gán voucher cá nhân (Personal Voucher) vào ví của 1 hoặc nhiều User
        /// </summary>
        [HttpPost("assign-user")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignVoucherToUser([FromBody] AssignUserVoucherDto dto)
        {
            try
            {
                await _voucherService.AssignVoucherToUserAsync(dto);
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Tặng mã giảm giá cho người dùng thành công!"
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

        // =========================================================================
        // HELPER METHOD: Lấy UserId an toàn từ Claims (Chống lỗi 401 null claim)
        // =========================================================================
        private int GetUserId()
        {
            var idClaim = User.FindFirst("UserId")
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("id");

            if (idClaim == null || !int.TryParse(idClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("Không xác thực được người dùng hoặc phiên đăng nhập đã hết hạn!");
            }
            return userId;
        }
    }
}