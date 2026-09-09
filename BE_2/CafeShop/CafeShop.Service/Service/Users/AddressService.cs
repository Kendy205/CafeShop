using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Address;
using CafeShop.Model;
using CafeShop.Services.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CafeShop.Services.Services
{
    public class AddressService : IAddressService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AddressService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        // ================= LẤY DANH SÁCH ĐỊA CHỈ =================
        public async Task<List<AddressResponseDto>> GetUserAddressesAsync(int userId)
        {
            // Chỉ lấy các địa chỉ chưa bị xóa (IsDeleted = false)
            // Sắp xếp: Địa chỉ mặc định (IsDefault = true) lên trên cùng, sau đó xếp theo ngày tạo mới nhất
            var addresses = await _unitOfWork.Address.GetAllAsync(
                filter: a => a.UserId == userId && !a.IsDeleted,
                orderBy: q => q.OrderByDescending(a => a.IsDefault).ThenByDescending(a => a.CreatedAt)
            );

            return _mapper.Map<List<AddressResponseDto>>(addresses);
        }

        // ================= LẤY CHI TIẾT 1 ĐỊA CHỈ =================
        public async Task<AddressResponseDto> GetAddressByIdAsync(int userId, int addressId)
        {
            var address = await _unitOfWork.Address.GetFirstOrDefaultAsync(
                a => a.AddressId == addressId && a.UserId == userId && !a.IsDeleted
            );

            if (address == null) throw new ArgumentException("Không tìm thấy địa chỉ!");

            return _mapper.Map<AddressResponseDto>(address);
        }

        // ================= THÊM ĐỊA CHỈ MỚI =================
        public async Task<AddressResponseDto> CreateAddressAsync(int userId, CreateAddressDto request)
        {
            var address = _mapper.Map<Address>(request);
            address.UserId = userId;
            address.CreatedAt = DateTime.UtcNow;
            address.IsDeleted = false;

            var existingAddresses = await _unitOfWork.Address.GetAllAsync(a => a.UserId == userId && !a.IsDeleted);

            // 1. Nếu đây là địa chỉ đầu tiên của khách -> Tự động biến thành Mặc định
            if (!existingAddresses.Any())
            {
                address.IsDefault = true;
            }
            // 2. Nếu khách chủ động check vào ô "Đặt làm mặc định" -> Tắt mặc định của các địa chỉ cũ
            else if (request.IsDefault)
            {
                var currentDefaults = existingAddresses.Where(a => a.IsDefault).ToList();
                foreach (var item in currentDefaults)
                {
                    item.IsDefault = false;
                    _unitOfWork.Address.Update(item);
                }
            }

            await _unitOfWork.Address.AddAsync(address);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<AddressResponseDto>(address);
        }

        // ================= CẬP NHẬT ĐỊA CHỈ =================
        public async Task<AddressResponseDto> UpdateAddressAsync(int userId, int addressId, UpdateAddressDto request)
        {
            var address = await _unitOfWork.Address.GetFirstOrDefaultAsync(
                a => a.AddressId == addressId && a.UserId == userId && !a.IsDeleted
            );

            if (address == null) throw new ArgumentException("Không tìm thấy địa chỉ!");

            // Nếu thay đổi từ "Bình thường" thành "Mặc định", phải đi tìm và gỡ mặc định của địa chỉ cũ
            if (request.IsDefault && !address.IsDefault)
            {
                var currentDefaults = await _unitOfWork.Address.GetAllAsync(
                    a => a.UserId == userId && a.IsDefault && a.AddressId != addressId && !a.IsDeleted
                );

                foreach (var item in currentDefaults)
                {
                    item.IsDefault = false;
                    _unitOfWork.Address.Update(item);
                }
            }

            // AutoMapper sẽ tự động đắp dữ liệu mới (RecipientName, Phone, FullAddress...) đè lên Entity cũ
            _mapper.Map(request, address);

            _unitOfWork.Address.Update(address);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<AddressResponseDto>(address);
        }

        // ================= ĐẶT LÀM MẶC ĐỊNH =================
        public async Task SetDefaultAddressAsync(int userId, int addressId)
        {
            var targetAddress = await _unitOfWork.Address.GetFirstOrDefaultAsync(
                a => a.AddressId == addressId && a.UserId == userId && !a.IsDeleted
            );

            if (targetAddress == null) throw new ArgumentException("Không tìm thấy địa chỉ!");
            if (targetAddress.IsDefault) return; // Nếu đã là mặc định rồi thì bỏ qua không cần update DB

            // Gỡ mặc định của tất cả địa chỉ cũ
            var currentDefaults = await _unitOfWork.Address.GetAllAsync(a => a.UserId == userId && a.IsDefault && !a.IsDeleted);
            foreach (var item in currentDefaults)
            {
                item.IsDefault = false;
                _unitOfWork.Address.Update(item);
            }

            // Bật mặc định cho địa chỉ mới
            targetAddress.IsDefault = true;
            _unitOfWork.Address.Update(targetAddress);
            await _unitOfWork.SaveAsync();
        }

        // ================= XÓA ĐỊA CHỈ (XÓA MỀM) =================
        public async Task DeleteAddressAsync(int userId, int addressId)
        {
            var address = await _unitOfWork.Address.GetFirstOrDefaultAsync(
                a => a.AddressId == addressId && a.UserId == userId && !a.IsDeleted
            );

            if (address == null) throw new ArgumentException("Không tìm thấy địa chỉ!");

            // Xóa mềm: Vẫn giữ data trong DB để hiển thị ở Hóa Đơn cũ, nhưng sẽ ẩn đi ở danh sách sổ địa chỉ
            address.IsDeleted = true;

            // Logic siêu xịn: Nếu địa chỉ bị xóa đang là địa chỉ mặc định -> Tự động chuyển mặc định cho địa chỉ cũ nhất còn lại
            if (address.IsDefault)
            {
                address.IsDefault = false;
                var nextAddress = await _unitOfWork.Address.GetFirstOrDefaultAsync(
                    filter: a => a.UserId == userId && a.AddressId != addressId && !a.IsDeleted
                   // orderBy: q => q.OrderBy(a => a.CreatedAt)
                );

                if (nextAddress != null)
                {
                    nextAddress.IsDefault = true;
                    _unitOfWork.Address.Update(nextAddress);
                }
            }

            _unitOfWork.Address.Update(address);
            await _unitOfWork.SaveAsync();
        }
    }
}