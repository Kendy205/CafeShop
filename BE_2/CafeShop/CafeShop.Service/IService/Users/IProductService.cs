using CafeShop.DTO.Admin;
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
