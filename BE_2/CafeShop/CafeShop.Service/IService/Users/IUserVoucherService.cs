using CafeShop.DTO.Voucher.Requests;
using CafeShop.DTO.Voucher.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Users
{
    public interface IUserVoucherService
    {
        Task<List<VoucherDto>> GetMyVouchersAsync(int userId);
        Task ClaimPublicVoucherAsync(int userId, string voucherCode);
    }
}
