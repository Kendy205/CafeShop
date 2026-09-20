using CafeShop.DTO.Admin;
using CafeShop.DTO.Product;
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
