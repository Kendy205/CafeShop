using CafeShop.DTO.Size;
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
    public class SizeController : ControllerBase
    {
        private readonly IAdminSizeService _sizeService;

        public SizeController(IAdminSizeService sizeService)
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUpdateSizeDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var result = await _sizeService.CreateSizeAsync(request);
                return Ok(ApiResponse<SizeDto>.Succeeded(result, 201, "Thêm Size thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed(ex.Message, 500));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateUpdateSizeDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<object>.Failed("Dữ liệu không hợp lệ", 400));

                var result = await _sizeService.UpdateSizeAsync(id, request);
                return Ok(ApiResponse<SizeDto>.Succeeded(result, 200, "Cập nhật Size thành công"));
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
                await _sizeService.DeleteSizeAsync(id);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Xóa Size thành công"));
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
    }
}
