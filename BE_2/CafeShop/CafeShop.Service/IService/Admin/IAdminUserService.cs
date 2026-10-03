using CafeShop.DTO.Category;
using CafeShop.DTO.Product;
using CafeShop.DTO.User;
using CafeShop.DTO.Order;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard;
using CafeShop.Service.Helpers;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminUserService
    {
        Task<PagedResult<AdminUserDto>> GetAllUsersAsync(string? searchKeyword, int pageNumber, int pageSize);
        Task<AdminUserDto?> GetUserByIdAsync(int id);
        Task<AdminUserDto> CreateUserAsync(CreateAdminUserDto dto);
        Task<AdminUserDto> UpdateUserAsync(int id, UpdateAdminUserDto dto);
        Task<bool> ToggleUserStatusAsync(int id);
        Task AssignRolesAsync(int userId, System.Collections.Generic.List<int> roleIds);
    }
}
