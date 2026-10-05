using CafeShop.Model;

namespace CafeShop.Repositories.IRepository
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<(IEnumerable<Product> Products, int TotalCount)> GetProductsWithPagingAsync(
            string? keyword,
            int? categoryId,
            decimal? minPrice,
            decimal? maxPrice,
            string? sortBy,
            int? minRating,
            int pageNumber,
            int pageSize,
            string? includeProperties = null);

        Task<(IEnumerable<Product> Products, int TotalCount)> GetAdminProductsWithPagingAsync(
            string? keyword,
            int? categoryId,
            decimal? minPrice,
            decimal? maxPrice,
            bool? isAvailable,
            bool? outOfStock,
            string? sortBy,
            int pageNumber,
            int pageSize,
            string? includeProperties = null);

        Task<IEnumerable<Product>> GetTopSellingProductsAsync(int count);
        Task<IEnumerable<Product>> GetNewestProductsAsync(int count);
        Task<IEnumerable<Product>> GetAutocompleteProductsAsync(string keyword, int count);
    }
}
