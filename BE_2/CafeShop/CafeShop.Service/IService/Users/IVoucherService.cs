using CafeShop.DTO.Voucher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Users
{
    public interface IVoucherService
    {
        // Client Methods
        Task<List<VoucherDto>> GetAvailableVouchersAsync(int userId);
        // Kiểm tra xem trước (không trừ lượt)
        Task<VoucherResponseDto> CheckVoucherAsync(int userId, CheckVoucherRequestDto request);

        // Áp dụng và trừ lượt dùng (chạy bên trong Transaction của Checkout/BuyNow)
        Task<(int VoucherId, decimal DiscountAmount)> ConsumeVoucherAsync(
            string voucherCode,
            int userId,
            decimal orderTotal,
            decimal shippingFee
        );

        // Admin Methods
        Task<object> GetAllVouchersAsync(int pageNumber, int pageSize);
        Task<VoucherDto?> GetVoucherByIdAsync(int id);
        Task<VoucherDto> CreateVoucherAsync(CreateVoucherDto dto);
        Task<VoucherDto> UpdateVoucherAsync(int id, UpdateVoucherDto dto);
        Task<bool> ToggleActiveAsync(int id);
        Task DeleteVoucherAsync(int id);
        Task AssignVoucherToUserAsync(AssignUserVoucherDto dto);
    }
}
