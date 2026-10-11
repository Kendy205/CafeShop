using CafeShop.DTO.Payment.Requests;
using CafeShop.DTO.Payment.Responses;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CafeShop.Controllers.User
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;

        public PaymentController(IVnPayService vnPayService)
        {
            _vnPayService = vnPayService;
        }

        private int GetUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!");
        }

        /// <summary>
        /// Tạo URL thanh toán VNPay cho đơn hàng đã tạo nhưng chưa thanh toán
        /// </summary>
        [HttpPost("vnpay/create-url")]
        [Authorize]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] CreatePaymentUrlRequestDto request)
        {
            try
            {
                int userId = GetUserId();
                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

                var result = await _vnPayService.CreatePaymentUrlAsync(request.OrderId, userId, ipAddress);

                return Ok(new ApiResponse<VnPayPaymentUrlResponseDto>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Tạo liên kết thanh toán VNPay thành công!",
                    Data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, StatusCode = 400, Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object> { Success = false, StatusCode = 400, Message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new ApiResponse<object> { Success = false, StatusCode = 403, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        /// <summary>
        /// VNPay Return URL (Trình duyệt của khách hàng được redirect về sau khi thanh toán)
        /// </summary>
        [HttpGet("vnpay/callback")]
        [AllowAnonymous]
        public async Task<IActionResult> VnPayCallback()
        {
            try
            {
                var result = await _vnPayService.ProcessReturnCallbackAsync(Request.Query);

                return Ok(new ApiResponse<VnPayCallbackResultDto>
                {
                    Success = result.Success,
                    StatusCode = result.Success ? 200 : 400,
                    Message = result.Message,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object> { Success = false, StatusCode = 500, Message = $"Lỗi xử lý callback: {ex.Message}" });
            }
        }

        /// <summary>
        /// VNPay IPN (Instant Payment Notification - Server to Server Webhook)
        /// Trả về đúng format VNPay yêu cầu: { "RspCode": "00", "Message": "Confirm Success" }
        /// </summary>
        [HttpGet("vnpay/ipn")]
        [AllowAnonymous]
        public async Task<IActionResult> VnPayIpn()
        {
            var response = await _vnPayService.ProcessIpnCallbackAsync(Request.Query);
            return Ok(response);
        }
    }
}
