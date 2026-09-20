using CafeShop.DTO.Voucher;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminVoucherService
    {
        Task<CafeShop.Service.Helpers.PagedResult<VoucherDto>> GetAllVouchersAsync(int pageNumber, int pageSize);
        Task<VoucherDto?> GetVoucherByIdAsync(int id);
        Task<VoucherDto> CreateVoucherAsync(CreateVoucherDto dto);
        Task<VoucherDto> UpdateVoucherAsync(int id, UpdateVoucherDto dto);
        Task<bool> ToggleActiveAsync(int id);
        Task DeleteVoucherAsync(int id);
        Task AssignVoucherToUserAsync(AssignUserVoucherDto dto);
    }
}
