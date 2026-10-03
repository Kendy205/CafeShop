using CafeShop.DTO.Category;
using CafeShop.DTO.Product;
using CafeShop.DTO.User;
using CafeShop.DTO.Order;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminShippingConfigService
    {
        Task<ShippingConfigDto> GetConfigAsync();
        Task<ShippingConfigDto> UpdateConfigAsync(UpdateShippingConfigDto request);
    }
}
