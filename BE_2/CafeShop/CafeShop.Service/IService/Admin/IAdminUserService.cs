using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;
using CafeShop.DTO.Product.Requests;
using CafeShop.DTO.Product.Responses;
using CafeShop.DTO.User;
using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard.Requests;
using CafeShop.DTO.Dashboard.Responses;
using CafeShop.Service.Helpers;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminUserService
    {
        Task<PagedResult<AdminUserDto>> GetAllUsersAsync(string? keyword, int pageNumber, int pageSize);
        Task<AdminUserDto?> GetUserByIdAsync(int id);
        Task<AdminUserDto> CreateUserAsync(CreateAdminUserDto dto);
        Task<AdminUserDto> UpdateUserAsync(int id, UpdateAdminUserDto dto);
        Task<bool> ToggleUserStatusAsync(int id);
        Task AssignRolesAsync(int userId, System.Collections.Generic.List<int> roleIds);
    }
}
