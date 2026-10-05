using CafeShop.Model;

namespace CafeShop.Repositories.IRepository
{
    public interface IOrderRepository : IRepository<Order>
    {
        Task<decimal> GetTotalRevenueAsync(DateTime? startDate, DateTime? endDate);
        Task<int> GetTotalProductsSoldAsync(DateTime? startDate, DateTime? endDate);
        Task<List<Order>> GetRecentOrdersAsync(int count);
        Task<List<(Product Product, int TotalQuantity, decimal TotalRevenue, List<(int? SizeId, int Quantity)> SizeSales)>> GetTopSellingProductsForAdminAsync(int top, DateTime? startDate, DateTime? endDate);
        Task<List<(User User, int TotalOrders, decimal TotalSpent)>> GetTopCustomersForAdminAsync(int top, DateTime? startDate, DateTime? endDate);
        Task<List<(string Label, decimal Revenue)>> GetRevenueChartDataAsync(DateTime? startDate, DateTime? endDate);
        Task<List<(string Status, int Count)>> GetOrderStatusStatsAsync(DateTime? startDate, DateTime? endDate);
    }
}
