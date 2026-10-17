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
        Task<IEnumerable<ProductResponseDto>> GetRelatedProductsAsync(int productId, int limit = 4);
    }
}
