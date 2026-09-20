using CafeShop.DTO.Topping;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using CafeShop.Service.IService.Admin;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
    public class ToppingController : ControllerBase
    {
        private readonly IAdminToppingService _toppingService;

        public ToppingController(IAdminToppingService toppingService)
        {
            _toppingService = toppingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _toppingService.GetAllToppingsAsync();
                return Ok(ApiResponse<List<ToppingDto>>.Succeeded(result, 200, "Thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateUpdateToppingDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var result = await _toppingService.CreateToppingAsync(request);
                return Ok(ApiResponse<ToppingDto>.Succeeded(result, 201, "Thêm topping thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromForm] CreateUpdateToppingDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var result = await _toppingService.UpdateToppingAsync(id, request);
                return Ok(ApiResponse<ToppingDto>.Succeeded(result, 200, "Cập nhật topping thành công"));
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

        [HttpPatch("{id:int}/toggle-availability")]
        public async Task<IActionResult> ToggleAvailability(int id)
        {
            try
            {
                await _toppingService.ToggleAvailabilityAsync(id);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Cập nhật trạng thái thành công"));
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

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _toppingService.DeleteAsync(id);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Xóa topping thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }
    }
}
