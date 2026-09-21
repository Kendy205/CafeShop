using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
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

        public ProductService(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
        }



        public async Task<PagedResult<ProductResponseDto>> GetAllAsync(string? keyword = null, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null, string? sortBy = null, int? minRating = null, int pageNumber = 1, int pageSize = 10)
        {
            // 1. Lấy toàn bộ dữ liệu (nếu hệ thống lớn, bạn nên tối ưu lại hàm này trong Repository để trả về IQueryable)
            var products = await _unitOfWork.Product.GetAllAsync(
                            filter: p => p.IsAvailable, // ONLY AVAILABLE
                            includeProperties: "Category,ProductSizes,ProductSizes.Size,Feedbacks");
            var query = products.AsQueryable();

            // 2. Lọc theo từ khóa (Tên đồ uống, mô tả, danh mục) - Fuzzy Search mảng
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.ToLower();
                query = query.Where(p => 
                    p.Name.ToLower().Contains(kw) || 
                    (p.Description != null && p.Description.ToLower().Contains(kw)) ||
                    (p.Category != null && p.Category.Name.ToLower().Contains(kw))
                );
            }

            // 3. Lọc theo danh mục (Cà phê, Trà sữa...)
            if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }

            // 4. Lọc theo khoảng giá
            if (minPrice.HasValue)
                query = query.Where(p => p.BasePrice >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.BasePrice <= maxPrice.Value);

            // Lọc theo đánh giá (Rating)
            if (minRating.HasValue)
            {
                query = query.Where(p => p.Feedbacks != null && p.Feedbacks.Any() && p.Feedbacks.Average(f => f.Rating) >= minRating.Value);
            }

            // 5. Sắp xếp (Sort)
            query = sortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.BasePrice),
                "price_desc" => query.OrderByDescending(p => p.BasePrice),
                "name_asc" => query.OrderBy(p => p.Name),
                "rating_desc" => query.OrderByDescending(p => p.Feedbacks != null && p.Feedbacks.Any() ? p.Feedbacks.Average(f => f.Rating) : 0),
                _ => query.OrderByDescending(p => p.ProductId) // Mặc định: Mới nhất xếp trước
            };

            // 6. Tính toán tổng số lượng để trả về cho Frontend làm nút phân trang
            int totalRecords = query.Count();

            // 7. Cắt lấy dữ liệu của trang hiện tại (Skip & Take)
            var pagedData = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            // 8. Dùng AutoMapper chuyển đổi Model -> DTO
            var mappedData = _mapper.Map<IEnumerable<ProductResponseDto>>(pagedData);

            return new PagedResult<ProductResponseDto>
            {
                Items = mappedData,
                Total = totalRecords,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ProductResponseDto?> GetByIdAsync(int id)
        {
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(
                p => p.ProductId == id && p.IsAvailable, // ONLY AVAILABLE
                includeProperties: "Category,ProductSizes,ProductSizes.Size"
            );

            if (product == null)
                return null;

            return _mapper.Map<ProductResponseDto>(product);
        }
        public async Task<SearchSuggestionDto> GetSearchSuggestionsAsync()
        {
            var allProducts = await _unitOfWork.Product.GetAllAsync(filter: p => p.IsAvailable, includeProperties: "Category,ProductSizes,ProductSizes.Size,Feedbacks");
            var orderDetails = await _unitOfWork.OrderDetail.GetAllAsync();

            var topSellingProductIds = orderDetails
                .GroupBy(od => od.ProductId)
                .Select(g => new { ProductId = g.Key, TotalQuantity = g.Sum(od => od.Quantity) })
                .OrderByDescending(x => x.TotalQuantity)
                .Take(5)
                .Select(x => x.ProductId)
                .ToList();

            var topSellingProducts = allProducts.Where(p => topSellingProductIds.Contains(p.ProductId)).ToList();
            var newestProducts = allProducts.OrderByDescending(p => p.ProductId).Take(5).ToList();

            return new SearchSuggestionDto
            {
                TopSellingProducts = _mapper.Map<IEnumerable<ProductResponseDto>>(topSellingProducts),
                NewestProducts = _mapper.Map<IEnumerable<ProductResponseDto>>(newestProducts)
            };
        }

        public async Task<IEnumerable<ProductAutocompleteDto>> GetAutocompleteSuggestionsAsync(string keyword)
        {
            var products = await _unitOfWork.Product.GetAllAsync(filter: p => p.IsAvailable);
            var kw = keyword.ToLower();
            
            var filtered = products
                .Where(p => p.Name.ToLower().Contains(kw))
                .Take(5)
                .Select(p => new ProductAutocompleteDto
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    ImageUrl = p.ImageUrl,
                    BasePrice = p.BasePrice
                })
                .ToList();

            return filtered;
        }
    }
}
