using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Product;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.Helpers;
using CafeShop.Services.IServices;

namespace CafeShop.Services.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProductService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public Task AddAsync(Product entity)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<PagedResult<ProductResponseDto>> GetAllAsync(string? keyword = null, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null, string? sortBy = null, int pageNumber = 1, int pageSize = 10)
        {
            // 1. Lấy toàn bộ dữ liệu (nếu hệ thống lớn, bạn nên tối ưu lại hàm này trong Repository để trả về IQueryable)
            var products = await _unitOfWork.Product.GetAllAsync(
                            includeProperties: "Category,ProductSizes,ProductSizes.Size");
            var query = products.AsQueryable();

            // 2. Lọc theo từ khóa (Tên đồ uống)
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(p => p.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase));
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

            // 5. Sắp xếp (Sort)
            query = sortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.BasePrice),
                "price_desc" => query.OrderByDescending(p => p.BasePrice),
                "name_asc" => query.OrderBy(p => p.Name),
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
            // 1. Thêm ProductSizes và ProductSizes.Size vào includeProperties để EF Core tự động Join bảng
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(
                p => p.ProductId == id,
                includeProperties: "Category,ProductSizes,ProductSizes.Size"
            );

            if (product == null)
                return null;

            // 2. Map các thông tin cơ bản bằng AutoMapper (Tên, BasePrice, CategoryName...)
            

            var mappedProduct = _mapper.Map<ProductResponseDto>(product);

            return mappedProduct;
        }




        public Task UpdateAsync(Product entity)
        {
            throw new NotImplementedException();
        }
    }
}
