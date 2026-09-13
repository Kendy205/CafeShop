using CafeShop.DTO.Order;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
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
        private readonly IShippingService _shippingService;

        public OrderController(IOrderService orderService,IShippingService shippingService)
        {
            _orderService = orderService;
            _shippingService = shippingService;
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

        [HttpGet("my-orders")]
        public async Task<IActionResult> GetMyOrders([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null)
        {
            try
            {
                int userId = GetUserId();
                var result = await _orderService.GetMyOrdersAsync(userId, pageNumber, pageSize,status);

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
        //[HttpPost("buy-now")]
        //public async Task<IActionResult> BuyNow([FromBody] CreateOrderDto request)
        //{
        //    try
        //    {
        //        int userId = GetUserId();
        //        var result = await _orderService.BuyNowAsync(userId, request);

        //        return Ok(new ApiResponse<OrderResponseDto>
        //        {
        //            Success = true,
        //            Message = "Mua ngay thành công!",
        //            Data = result
        //        });
        //    }
        //    catch (ArgumentException ex)
        //    {
        //        return BadRequest(new ApiResponse<object> { Success = false, Message = ex.Message });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new ApiResponse<object> { Success = false, Message = $"Lỗi hệ thống: {ex.Message}" });
        //    }
        //}
        [HttpPost("calculate-fee")]
        public async Task<IActionResult> CalculateShippingFee([FromBody] double distanceKm)
        {
            try
            {
                // Controller gọi Service, không chứa bất kỳ logic tính toán nào
                decimal fee = await _shippingService.CalculateFeeAsync(distanceKm);

                return Ok(new ApiResponse<decimal>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Tính phí ship thành công",
                    Data = fee
                });
            }
            catch (ArgumentException ex)
            {
                // Bắt lỗi bán kính quá xa do Service ném ra
                return BadRequest(new ApiResponse<decimal>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<decimal> { Success = false, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}