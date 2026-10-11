using CafeShop.DTO.Role.Requests;
using CafeShop.DTO.Role.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminRoleService
    {
        Task<List<PermissionDto>> GetAllPermissionsAsync();
        Task<List<RoleDto>> GetAllRolesAsync();
        Task<RoleDto?> GetRoleByIdAsync(int id);
        Task<RoleDto> CreateRoleAsync(RoleRequestDto dto);
        Task<RoleDto> UpdateRoleAsync(int id, RoleRequestDto dto);
        Task DeleteRoleAsync(int id);
    }
}
