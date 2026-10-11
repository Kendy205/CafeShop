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
using CafeShop.DTO.Product.Requests;
using CafeShop.DTO.Product.Responses;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminProductService
    {
        Task<PagedResult<ProductResponseDto>> GetAllAsync(
            string? keyword = null,
            int? categoryId = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            bool? isAvailable = null,
            bool? outOfStock = null,
            string? sortBy = null,
            int pageNumber = 1,
            int pageSize = 10);
            
        Task<ProductResponseDto> GetByIdAsync(int id);
        
        Task<ProductResponseDto> CreateProductAsync(CreateUpdateProductDto request);
        Task<ProductResponseDto> UpdateProductAsync(int id, CreateUpdateProductDto request);
        Task ToggleAvailabilityAsync(int id);
        Task DeleteAsync(int id);
    }
}
