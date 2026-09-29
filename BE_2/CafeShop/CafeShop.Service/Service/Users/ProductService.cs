using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Product;
using CafeShop.DTO.Admin;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;
using System.Text.Json;
using CafeShop.Service.IService;

namespace CafeShop.Services.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;
        private readonly IRedisCacheService _redisCache;
        private readonly TimeSpan _defaultCacheExpiration = TimeSpan.FromMinutes(5);

        public ProductService(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService, IRedisCacheService redisCache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
            _redisCache = redisCache;
        }



        public async Task<PagedResult<ProductResponseDto>> GetAllAsync(string? keyword = null, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null, string? sortBy = null, int? minRating = null, int pageNumber = 1, int pageSize = 10)
        {
            string cacheKey = $"cafeshop:products:all:kw:{keyword ?? "none"}:cat:{categoryId ?? 0}:minP:{minPrice ?? 0}:maxP:{maxPrice ?? 0}:sort:{sortBy ?? "none"}:minR:{minRating ?? 0}:page:{pageNumber}:size:{pageSize}";
            var cachedResult = await _redisCache.GetAsync<PagedResult<ProductResponseDto>>(cacheKey);
            if (cachedResult != null) return cachedResult;

            var (products, totalCount) = await _unitOfWork.Product.GetProductsWithPagingAsync(
                keyword, categoryId, minPrice, maxPrice, sortBy, minRating, pageNumber, pageSize,
                includeProperties: "Category,ProductSizes,ProductSizes.Size,Feedbacks");

            // 2. Dùng AutoMapper chuyển đổi Model -> DTO
            var mappedData = _mapper.Map<IEnumerable<ProductResponseDto>>(products);

            var result = new PagedResult<ProductResponseDto>
            {
                Items = mappedData,
                Total = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };

            await _redisCache.SetAsync(cacheKey, result, _defaultCacheExpiration);
            return result;
        }

        public async Task<ProductResponseDto?> GetByIdAsync(int id)
        {
            string cacheKey = $"cafeshop:products:id:{id}";
            var cachedResult = await _redisCache.GetAsync<ProductResponseDto>(cacheKey);
            if (cachedResult != null) return cachedResult;

            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(
                p => p.ProductId == id && p.IsAvailable, // ONLY AVAILABLE
                includeProperties: "Category,ProductSizes,ProductSizes.Size,ProductToppings,ProductToppings.Topping"
            );

            if (product == null)
                return null;

            var result = _mapper.Map<ProductResponseDto>(product);
            await _redisCache.SetAsync(cacheKey, result, _defaultCacheExpiration);
            return result;
        }
        public async Task<SearchSuggestionDto> GetSearchSuggestionsAsync()
        {
            var topSellingProducts = await _unitOfWork.Product.GetTopSellingProductsAsync(5);
            var newestProducts = await _unitOfWork.Product.GetNewestProductsAsync(5);

            return new SearchSuggestionDto
            {
                TopSellingProducts = _mapper.Map<IEnumerable<ProductResponseDto>>(topSellingProducts),
                NewestProducts = _mapper.Map<IEnumerable<ProductResponseDto>>(newestProducts)
            };
        }

        public async Task<IEnumerable<ProductAutocompleteDto>> GetAutocompleteSuggestionsAsync(string keyword)
        {
            var filteredProducts = await _unitOfWork.Product.GetAutocompleteProductsAsync(keyword, 5);
            
            var result = filteredProducts
                .Select(p => new ProductAutocompleteDto
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    ImageUrl = p.ImageUrl,
                    BasePrice = p.BasePrice
                })
                .ToList();

            return result;
        }
    }
}
