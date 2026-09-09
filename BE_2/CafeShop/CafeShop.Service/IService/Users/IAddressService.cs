using CafeShop.DTO.Address;
using CafeShop.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.IServices
{
    public interface IAddressService
    {
        //Task<IEnumerable<Address>> GetAllAsync();
        //Task<Address> GetByIdAsync(int id);
        //Task AddAsync(Address entity);
        //Task UpdateAsync(Address entity);
        //Task DeleteAsync(int id);
       // Lấy danh sách địa chỉ(đã sắp xếp mặc định lên đầu)
        Task<List<AddressResponseDto>> GetUserAddressesAsync(int userId);

        // Lấy chi tiết 1 địa chỉ
        Task<AddressResponseDto> GetAddressByIdAsync(int userId, int addressId);

        // Thêm địa chỉ mới
        Task<AddressResponseDto> CreateAddressAsync(int userId, CreateAddressDto request);

        // Cập nhật địa chỉ
        Task<AddressResponseDto> UpdateAddressAsync(int userId, int addressId, UpdateAddressDto request);

        // Xóa mềm địa chỉ
        Task DeleteAddressAsync(int userId, int addressId);

        // Đặt làm địa chỉ mặc định
        Task SetDefaultAddressAsync(int userId, int addressId);
    }
}
