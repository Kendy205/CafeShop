using CafeShop.DTO.StoreProfile;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using CafeShop.Uitls;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CafeShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoreProfilesController : ControllerBase
    {
        private readonly IStoreProfileService _storeProfileService;

        public StoreProfilesController(IStoreProfileService storeProfileService)
        {
            _storeProfileService = storeProfileService;
        }

        [HttpGet]
        public async Task<IActionResult> GetStoreProfile()
        {
            try
            {
                var profile = await _storeProfileService.GetStoreProfileAsync();
                return Ok(ApiResponse<StoreProfileDto>.Succeeded(profile, 200, "Lấy cấu hình cửa hàng thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPut]
        [Authorize(Roles = SystemRole.Admin)]
        public async Task<IActionResult> UpdateStoreProfile([FromBody] UpdateStoreProfileDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400, ModelState));
            }

            try
            {
                var updatedProfile = await _storeProfileService.UpdateStoreProfileAsync(dto);
                return Ok(ApiResponse<StoreProfileDto>.Succeeded(updatedProfile, 200, "Cập nhật cấu hình cửa hàng thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }
    }
}
