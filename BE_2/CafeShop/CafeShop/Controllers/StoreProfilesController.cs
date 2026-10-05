using CafeShop.DTO.StoreProfile;
using CafeShop.Service.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
            var profile = await _storeProfileService.GetStoreProfileAsync();
            return Ok(new { data = profile });
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStoreProfile([FromBody] UpdateStoreProfileDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedProfile = await _storeProfileService.UpdateStoreProfileAsync(dto);
            return Ok(new { message = "Cập nhật cấu hình cửa hàng thành công", data = updatedProfile });
        }
    }
}
