using CafeShop.DTO.Voucher.Requests;
using CafeShop.DTO.Voucher.Responses;
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
        Task<(int VoucherId, decimal DiscountAmount, string ApplyType)> ConsumeVoucherAsync(
            string voucherCode,
            int userId,
            decimal orderTotal,
            decimal shippingFee
        );

        Task<BestVoucherResponseDto?> GetBestVoucherAsync(int userId, BestVoucherRequestDto request);
    }
}
