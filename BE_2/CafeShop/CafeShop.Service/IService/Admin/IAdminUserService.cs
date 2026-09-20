using CafeShop.DTO.Admin;
using CafeShop.Service.Helpers;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminUserService
    {
        Task<PagedResult<AdminUserDto>> GetAllUsersAsync(string? searchKeyword, int pageNumber, int pageSize);
        Task<AdminUserDto?> GetUserByIdAsync(int id);
        Task<bool> ToggleUserStatusAsync(int id);
    }
}
