using CafeShop.DTO.Address;
using CafeShop.Services.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using CafeShop.Service.Helpers;

namespace CafeShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public AddressController(IAddressService addressService)
        {
            _addressService = addressService;
        }

        private int GetUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out int userId)) return userId;
            throw new UnauthorizedAccessException("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!");
        }

        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            try
            {
                var result = await _addressService.GetUserAddressesAsync(GetUserId());
                return Ok(ApiResponse<List<AddressResponseDto>>.Succeeded(result, 200, "Lấy danh sách địa chỉ thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddressById(int id)
        {
            try
            {
                var result = await _addressService.GetAddressByIdAsync(GetUserId(), id);
                return Ok(ApiResponse<AddressResponseDto>.Succeeded(result, 200, "Thành công!"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto request)
        {
            try
            {
                var result = await _addressService.CreateAddressAsync(GetUserId(), request);
                return Ok(ApiResponse<AddressResponseDto>.Succeeded(result, 200, "Thêm địa chỉ thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] UpdateAddressDto request)
        {
            try
            {
                var result = await _addressService.UpdateAddressAsync(GetUserId(), id, request);
                return Ok(ApiResponse<AddressResponseDto>.Succeeded(result, 200, "Cập nhật địa chỉ thành công!"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            try
            {
                await _addressService.DeleteAddressAsync(GetUserId(), id);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Xóa địa chỉ thành công!"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpPatch("{id}/default")]
        public async Task<IActionResult> SetDefaultAddress(int id)
        {
            try
            {
                await _addressService.SetDefaultAddressAsync(GetUserId(), id);
                return Ok(ApiResponse<object>.Succeeded(null, 200, "Đã đặt làm địa chỉ mặc định!"));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse<object>.Failed(ex.Message, 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }
    }
}