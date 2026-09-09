using CafeShop.DTO.Topping;
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
    public class ToppingController : ControllerBase
    {
        private readonly IToppingService _toppingService;

        public ToppingController(IToppingService toppingService)
        {
            _toppingService = toppingService;
        }

        // Dành cho Client lấy danh sách Topping đang mở bán
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableToppings()
        {
            try
            {
                var result = await _toppingService.GetAllToppingsAsync(onlyAvailable: true);
                return Ok(ApiResponse<List<ToppingDto>>.Succeeded(result, 200, "Thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        // Dành cho Admin lấy tất cả
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _toppingService.GetAllToppingsAsync(onlyAvailable: false);
                return Ok(ApiResponse<List<ToppingDto>>.Succeeded(result, 200, "Thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        // Tương tự, có thể thêm [HttpPost], [HttpPut], [HttpPatch("toggle")] cho Admin
    }
}