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
using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
using CafeShop.Filters;
using CafeShop.Uitls;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

using CafeShop.Service.IService.Admin;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = $"{SystemRole.Admin},{SystemRole.Staff}")]
    public class OrderController : ControllerBase
    {
        private readonly IAdminOrderService _orderService;

        public OrderController(IAdminOrderService orderService)
        {
            _orderService = orderService;
        }

        private int GetCurrentUserId()
        {
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Phiên đăng nhập không hợp lệ!");
        }

        [HttpGet]
        [HasPermission(SystemPermissions.OrderView)]
        public async Task<IActionResult> GetAll(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
              [FromQuery] string? keyword = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null
           )
        {
            try
            {
                var result = await _orderService.GetAllOrdersAsync(pageNumber, pageSize, status, startDate, endDate, keyword);
                return Ok(ApiResponse<PagedResult<OrderResponseDto>>.Succeeded(result, 200, "Lấy danh sách đơn hàng thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpGet("user/{userId:int}/completed")]
        [HasPermission(SystemPermissions.OrderView)]
        public async Task<IActionResult> GetUserCompletedOrders(
            int userId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var result = await _orderService.GetUserCompletedOrdersAsync(userId, pageNumber, pageSize, startDate, endDate);
                return Ok(ApiResponse<PagedResult<OrderResponseDto>>.Succeeded(result, 200, "Lấy danh sách đơn hàng hoàn thành của khách hàng thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpGet("{id:int}")]
        [HasPermission(SystemPermissions.OrderView)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _orderService.GetOrderDetailsAsync(id);
                return Ok(ApiResponse<OrderResponseDto>.Succeeded(result, 200, "Lấy chi tiết đơn hàng thành công"));
            }
            catch (ArgumentException ex)
            {
                return NotFound(ApiResponse<object>.Failed(ex.Message, 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpPut("{id:int}/status")]
        [HasPermission(SystemPermissions.OrderUpdateStatus)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                int currentUserId = GetCurrentUserId();
                await _orderService.UpdateOrderStatusAsync(currentUserId, id, request.NewStatus, request.CancelReason);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Cập nhật trạng thái đơn hàng thành công"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }
    }
}
