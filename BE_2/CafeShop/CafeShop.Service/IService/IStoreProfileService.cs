using CafeShop.DTO.StoreProfile;
using System.Threading.Tasks;

namespace CafeShop.Service.IService
{
    public interface IStoreProfileService
    {
        Task<StoreProfileDto> GetStoreProfileAsync();
        Task<StoreProfileDto> UpdateStoreProfileAsync(UpdateStoreProfileDto dto);
    }
}
