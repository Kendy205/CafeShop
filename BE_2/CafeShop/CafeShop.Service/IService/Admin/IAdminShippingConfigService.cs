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
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminShippingConfigService
    {
        Task<ShippingConfigDto> GetConfigAsync();
        Task<ShippingConfigDto> UpdateConfigAsync(UpdateShippingConfigDto request);
    }
}
