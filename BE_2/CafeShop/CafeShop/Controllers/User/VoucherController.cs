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