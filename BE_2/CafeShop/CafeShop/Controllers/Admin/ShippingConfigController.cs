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
using System;
using System.Threading.Tasks;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
    public class ShippingConfigController : ControllerBase
    {
        private readonly IAdminShippingConfigService _shippingConfigService;

        public ShippingConfigController(IAdminShippingConfigService shippingConfigService)
        {
            _shippingConfigService = shippingConfigService;
        }

        [HttpGet]
        public async Task<IActionResult> GetConfig()
        {
            try
            {
                var result = await _shippingConfigService.GetConfigAsync();
                return Ok(ApiResponse<ShippingConfigDto>.Succeeded(result, 200, "Lấy cấu hình thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateConfig([FromBody] UpdateShippingConfigDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var result = await _shippingConfigService.UpdateConfigAsync(request);
                return Ok(ApiResponse<ShippingConfigDto>.Succeeded(result, 200, "Cập nhật cấu hình thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }
    }
}
