using CafeShop.DTO.Admin;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminShippingConfigService
    {
        Task<ShippingConfigDto> GetConfigAsync();
        Task<ShippingConfigDto> UpdateConfigAsync(UpdateShippingConfigDto request);
    }
}
