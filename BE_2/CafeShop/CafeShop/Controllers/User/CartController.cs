using CafeShop.DTO.Cart;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CafeShop.Controllers.User
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
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

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                int userId = GetUserId();
                var cart = await _cartService.GetCartAsync(userId);
                return Ok(ApiResponse<CartResponseDto>.Succeeded(cart,200, "Lấy giỏ hàng thành công!"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<CartResponseDto>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<CartResponseDto>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequestDto dto)
        {
            try
            {
                int userId = GetUserId();
                await _cartService.AddToCartAsync(userId, dto);
                return Ok(ApiResponse<string>.Succeeded(null,200, "Đã thêm món vào giỏ!"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<string>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        // Lưu ý: Nhận số lượng từ đường dẫn (Query) hoặc Body đều được. Ở đây mình dùng Query cho gọn.
        [HttpPut("update-quantity/{cartItemId}")]
        public async Task<IActionResult> UpdateQuantity(int cartItemId, [FromQuery] int quantity)
        {
            try
            {
                int userId = GetUserId();
                await _cartService.UpdateQuantityAsync(userId, cartItemId, quantity);
                return Ok(ApiResponse<string>.Succeeded(null,200, "Đã cập nhật số lượng!"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<string>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpDelete("remove/{cartItemId}")]
        public async Task<IActionResult> RemoveItem(int cartItemId)
        {
            try
            {
                int userId = GetUserId();
                await _cartService.RemoveItemAsync(userId, cartItemId);
                return Ok(ApiResponse<string>.Succeeded(null,200, "Đã xóa món khỏi giỏ!"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<string>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                int userId = GetUserId();
                await _cartService.ClearCartAsync(userId);
                return Ok(ApiResponse<string>.Succeeded(null,200, "Đã dọn sạch giỏ hàng!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }
    }
}
