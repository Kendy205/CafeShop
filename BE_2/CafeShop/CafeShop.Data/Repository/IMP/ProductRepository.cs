using CafeShop.Data;
using CafeShop.Data.Repository.IMP;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using Microsoft.EntityFrameworkCore;

namespace CafeShop.Repositories.Repository
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Product> Products, int TotalCount)> GetProductsWithPagingAsync(
            string? keyword,
            int? categoryId,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy,
            int? minRating,
            int pageNumber,
            int pageSize,
            string? includeProperties = null)
        {
            var query = dbSet.AsQueryable().Where(p => p.IsAvailable && !p.IsDeleted);

            if (!string.IsNullOrWhiteSpace(includeProperties))
            {
                foreach (var includeProp in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp.Trim());
                }
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.ToLower();
                query = query.Where(p => 
                    p.Name.ToLower().Contains(kw) || 
                    (p.Description != null && p.Description.ToLower().Contains(kw)) ||
                    (p.Category != null && p.Category.Name.ToLower().Contains(kw))
                );
            }

            if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }

            if (minPrice.HasValue)
                query = query.Where(p => p.BasePrice >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.BasePrice <= maxPrice.Value);

            if (minRating.HasValue)
            {
                query = query.Where(p => (p.Feedbacks.Average(f => (double?)f.Rating) ?? 0) >= minRating.Value);
            }

            query = sortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.BasePrice),
                "price_desc" => query.OrderByDescending(p => p.BasePrice),
                "name_asc" => query.OrderBy(p => p.Name),
                "rating_desc" => query.OrderByDescending(p => p.Feedbacks.Average(f => (double?)f.Rating) ?? 0),
                _ => query.OrderByDescending(p => p.ProductId) 
            };

            int totalCount = await query.CountAsync();

            var products = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<(IEnumerable<Product> Products, int TotalCount)> GetAdminProductsWithPagingAsync(
            string? keyword,
            int? categoryId,
            decimal? minPrice,
            decimal? maxPrice,
            bool? isAvailable,
            bool? outOfStock,
            string? sortBy,
            int pageNumber,
            int pageSize,
            string? includeProperties = null)
        {
            var query = dbSet.AsQueryable().Where(p => !p.IsDeleted);

            if (!string.IsNullOrWhiteSpace(includeProperties))
            {
                foreach (var includeProp in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp.Trim());
                }
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.ToLower();
                query = query.Where(p => 
                    p.Name.ToLower().Contains(kw) || 
                    (p.Description != null && p.Description.ToLower().Contains(kw)) ||
                    (p.Category != null && p.Category.Name.ToLower().Contains(kw))
                );
            }

            if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }

            if (minPrice.HasValue)
                query = query.Where(p => p.BasePrice >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.BasePrice <= maxPrice.Value);

            if (isAvailable.HasValue)
                query = query.Where(p => p.IsAvailable == isAvailable.Value);

            if (outOfStock.HasValue && outOfStock.Value)
            {
                query = query.Where(p => p.StockQuantity <= 0 && (!p.ProductSizes!.Any() || p.ProductSizes!.All(ps => ps.StockQuantity <= 0)));
            }

            query = sortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.BasePrice),
                "price_desc" => query.OrderByDescending(p => p.BasePrice),
                "name_asc" => query.OrderBy(p => p.Name),
                "stock_asc" => query.OrderBy(p => p.StockQuantity),
                "stock_desc" => query.OrderByDescending(p => p.StockQuantity),
                _ => query.OrderByDescending(p => p.ProductId) 
            };

            int totalCount = await query.CountAsync();

            var products = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<IEnumerable<Product>> GetTopSellingProductsAsync(int count)
        {
            var topProductIds = await _context.OrderDetails
                .GroupBy(od => od.ProductId)
                .Select(g => new { ProductId = g.Key, TotalQuantity = g.Sum(od => od.Quantity) })
                .OrderByDescending(x => x.TotalQuantity)
                .Take(count)
                .Select(x => x.ProductId)
                .ToListAsync();

            return await dbSet
                .Where(p => p.IsAvailable && !p.IsDeleted && topProductIds.Contains(p.ProductId))
                .Include(p => p.Category)
                .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                .Include(p => p.Feedbacks)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetNewestProductsAsync(int count)
        {
            return await dbSet
                .Where(p => p.IsAvailable && !p.IsDeleted)
                .OrderByDescending(p => p.ProductId)
                .Take(count)
                .Include(p => p.Category)
                .Include(p => p.ProductSizes).ThenInclude(ps => ps.Size)
                .Include(p => p.Feedbacks)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetAutocompleteProductsAsync(string keyword, int count)
        {
            var kw = keyword.ToLower();
            return await dbSet
                .Where(p => p.IsAvailable && !p.IsDeleted && p.Name.ToLower().Contains(kw))
                .Take(count)
                .ToListAsync();
        }
    }
}
