using CafeShop.DTO.Size;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SizeController : ControllerBase
    {
        private readonly ISizeService _sizeService;

        public SizeController(ISizeService sizeService)
        {
            _sizeService = sizeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _sizeService.GetAllSizesAsync();
                return Ok(ApiResponse<List<SizeDto>>.Succeeded(result, 200, "Thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        // Tương tự, bạn có thể tự thêm các [HttpPost], [HttpPut], [HttpDelete] cho Admin CRUD
    }
}