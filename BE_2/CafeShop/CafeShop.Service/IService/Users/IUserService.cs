using CafeShop.DTO.User;
using CafeShop.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Service.IService
{
    public interface IUserService
    {
        Task<UserProfileDto> GetProfileAsync(int userId);
        Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto request);
        Task ChangePasswordAsync(int userId, ChangePasswordDto request);
    }
}
