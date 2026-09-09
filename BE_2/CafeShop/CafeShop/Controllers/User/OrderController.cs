using CafeShop.DTO.Order;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CafeShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // ==========================================
        // HÀM BÍ MẬT: Móc túi Token để lấy UserId
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

        // 1. API Đặt hàng (Checkout)
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto request)
        {
            try
            {
                int userId = GetUserId();
                var result = await _orderService.CheckoutAsync(userId, request);

                return Ok(new ApiResponse<OrderResponseDto>
                {
                    Success = true,
                    Message = "Đặt hàng thành công!",
                    Data = result
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                return BadRequest(ApiResponse<string>.Failed("Đơn hàng đã được xử lý bởi người khác, vui lòng thử lại!", 409));

            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // 2. API Xem trước giảm giá (Check Voucher)
        //[HttpPost("check-voucher")]
        //public async Task<IActionResult> CheckVoucher([FromBody] CheckVoucherRequestDto request)
        //{
        //    try
        //    {
        //        if (string.IsNullOrWhiteSpace(request.VoucherCode))
        //            return BadRequest(new ApiResponse<object> { Success = false, Message = "Mã giảm giá không được để trống!" });

           

        //        int userId = GetUserId();

        //        // Gọi Service (đoạn code CheckVoucherAsync vừa nãy)
        //        var result = await _orderService.CheckVoucherAsync(userId, request);

        //        return Ok(ApiResponse<VoucherResponseDto>.Succeeded(result, 200, "Áp dụng mã giảm giá thành công!"));
        //    }
        //    catch (ArgumentException ex)
        //    {
        //        // Fail-fast nếu mã lỗi, hết hạn, hoặc không đủ điều kiện
        //        return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
        //    }
        //}

        // 3. API Lấy danh sách lịch sử đơn hàng của tôi
        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                int userId = GetUserId();
                var result = await _orderService.GetMyOrdersAsync(userId, pageNumber, pageSize);

                return Ok(new ApiResponse<PagedResult<OrderResponseDto>>
                {
                    Success = true,
                    Message = "Lấy lịch sử đơn hàng thành công!",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        // 4. API Hủy đơn hàng
        [HttpPut("cancel/{orderId}")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            try
            {
                int userId = GetUserId();
                await _orderService.CancelOrderAsync(userId, orderId);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Hủy đơn hàng thành công!"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
        //5 Buy now
        [HttpPost("buy-now")]
        public async Task<IActionResult> BuyNow([FromBody] CreateOrderDto request)
        {
            try
            {
                int userId = GetUserId();
                var result = await _orderService.BuyNowAsync(userId, request);

                return Ok(new ApiResponse<OrderResponseDto>
                {
                    Success = true,
                    Message = "Mua ngay thành công!",
                    Data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}