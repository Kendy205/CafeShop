using CafeShop.DTO.Category;
using CafeShop.DTO.Product;
using CafeShop.DTO.User;
using CafeShop.DTO.Order;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard;
using CafeShop.DTO.Product;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.IServices
{
    public interface IProductService
    {
        Task<PagedResult<ProductResponseDto>> GetAllAsync(
            string? keyword = null,
            int? categoryId = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            string? sortBy = null,
            int? minRating = null,
            int pageNumber = 1,
            int pageSize = 10); 
            
        Task<ProductResponseDto?> GetByIdAsync(int id);
        Task<SearchSuggestionDto> GetSearchSuggestionsAsync();
        Task<IEnumerable<ProductAutocompleteDto>> GetAutocompleteSuggestionsAsync(string keyword);
    }
}
