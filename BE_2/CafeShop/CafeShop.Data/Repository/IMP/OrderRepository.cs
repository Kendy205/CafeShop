using CafeShop.Data;
using CafeShop.Data.Repository.IMP;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CafeShop.Repositories.Repository
{
    public class OrderRepository : Repository<Order>, IOrderRepository
    {
        public OrderRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<decimal> GetTotalRevenueAsync(DateTime? startDate, DateTime? endDate)
        {
            var query = dbSet.Where(o => o.CurrentStatus == CafeShop.Uitls.OrderStatus.Completed);
            if (startDate.HasValue) query = query.Where(o => o.OrderDate >= startDate.Value);
            if (endDate.HasValue) query = query.Where(o => o.OrderDate <= endDate.Value);
            return await query.SumAsync(o => o.TotalAmount);
        }

        public async Task<int> GetTotalProductsSoldAsync(DateTime? startDate, DateTime? endDate)
        {
            var query = dbSet.Where(o => o.CurrentStatus == CafeShop.Uitls.OrderStatus.Completed);
            if (startDate.HasValue) query = query.Where(o => o.OrderDate >= startDate.Value);
            if (endDate.HasValue) query = query.Where(o => o.OrderDate <= endDate.Value);
            
            return await query.SelectMany(o => o.OrderDetails).SumAsync(od => od.Quantity);
        }

        public async Task<List<Order>> GetRecentOrdersAsync(int count)
        {
            return await dbSet
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .Take(count)
                .ToListAsync();
        }

        public async Task<List<(Product Product, int TotalQuantity, decimal TotalRevenue, List<(int? SizeId, int Quantity)> SizeSales)>> GetTopSellingProductsForAdminAsync(int top, DateTime? startDate, DateTime? endDate)
        {
            var query = dbSet.Where(o => o.CurrentStatus == CafeShop.Uitls.OrderStatus.Completed);
            if (startDate.HasValue) query = query.Where(o => o.OrderDate >= startDate.Value);
            if (endDate.HasValue) query = query.Where(o => o.OrderDate <= endDate.Value);

            var topProductsQuery = query
                .SelectMany(o => o.OrderDetails)
                .GroupBy(od => od.ProductId)
                .Select(g => new { ProductId = g.Key, TotalQuantity = g.Sum(od => od.Quantity), TotalRevenue = g.Sum(od => od.UnitPrice * od.Quantity) })
                .OrderByDescending(x => x.TotalQuantity)
                .Take(top);

            var topProducts = await topProductsQuery.ToListAsync();
            var productIds = topProducts.Select(tp => tp.ProductId).ToList();

            var sizeSalesData = await query
                .SelectMany(o => o.OrderDetails)
                .Where(od => productIds.Contains(od.ProductId))
                .GroupBy(od => new { od.ProductId, od.SizeId })
                .Select(g => new { g.Key.ProductId, g.Key.SizeId, Quantity = g.Sum(od => od.Quantity) })
                .ToListAsync();

            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductSizes!).ThenInclude(ps => ps.Size)
                .Where(p => productIds.Contains(p.ProductId))
                .ToListAsync();

            var result = new List<(Product Product, int TotalQuantity, decimal TotalRevenue, List<(int? SizeId, int Quantity)> SizeSales)>();
            foreach (var item in topProducts)
            {
                var product = products.FirstOrDefault(p => p.ProductId == item.ProductId);
                if (product != null)
                {
                    var sizes = sizeSalesData.Where(s => s.ProductId == item.ProductId).Select(s => (s.SizeId, s.Quantity)).ToList();
                    result.Add((product, item.TotalQuantity, item.TotalRevenue, sizes));
                }
            }

            return result;
        }

        public async Task<List<(User User, int TotalOrders, decimal TotalSpent)>> GetTopCustomersForAdminAsync(int top, DateTime? startDate, DateTime? endDate)
        {
            var query = dbSet.Where(o => o.CurrentStatus == CafeShop.Uitls.OrderStatus.Completed);
            if (startDate.HasValue) query = query.Where(o => o.OrderDate >= startDate.Value);
            if (endDate.HasValue) query = query.Where(o => o.OrderDate <= endDate.Value);

            var topCustomersQuery = query
                .GroupBy(o => o.UserId)
                .Select(g => new { UserId = g.Key, TotalOrders = g.Count(), TotalSpent = g.Sum(o => o.TotalAmount) })
                .OrderByDescending(x => x.TotalSpent)
                .Take(top);

            var topCustomers = await topCustomersQuery.ToListAsync();
            var userIds = topCustomers.Select(tc => tc.UserId).ToList();

            var users = await _context.Users
                .Where(u => userIds.Contains(u.UserId))
                .ToListAsync();

            var result = new List<(User User, int TotalOrders, decimal TotalSpent)>();
            foreach (var item in topCustomers)
            {
                var user = users.FirstOrDefault(u => u.UserId == item.UserId);
                if (user != null)
                {
                    result.Add((user, item.TotalOrders, item.TotalSpent));
                }
            }

            return result;
        }

        public async Task<List<(string Label, decimal Revenue)>> GetRevenueChartDataAsync(DateTime? startDate, DateTime? endDate)
        {
            var query = dbSet.Where(o => o.CurrentStatus == CafeShop.Uitls.OrderStatus.Completed);
            if (startDate.HasValue) query = query.Where(o => o.OrderDate >= startDate.Value);
            if (endDate.HasValue) query = query.Where(o => o.OrderDate <= endDate.Value);

            // Group by date (Date component of OrderDate)
            var rawData = await query
                .Select(o => new { o.OrderDate.Date, o.TotalAmount })
                .ToListAsync();

            var chartData = rawData
                .GroupBy(o => o.Date.ToString("yyyy-MM-dd"))
                .Select(g => (Label: g.Key, Revenue: g.Sum(o => o.TotalAmount)))
                .OrderBy(d => d.Label)
                .ToList();

            return chartData;
        }

        public async Task<List<(string Status, int Count)>> GetOrderStatusStatsAsync(DateTime? startDate, DateTime? endDate)
        {
            var query = dbSet.AsQueryable();
            if (startDate.HasValue) query = query.Where(o => o.OrderDate >= startDate.Value);
            if (endDate.HasValue) query = query.Where(o => o.OrderDate <= endDate.Value);

            var stats = await query
                .GroupBy(o => o.CurrentStatus)
                .Select(g => new { Status = g.Key ?? "Unknown", Count = g.Count() })
                .ToListAsync();

            return stats.Select(s => (s.Status, s.Count)).ToList();
        }

        public async Task<(IEnumerable<Order> Orders, int TotalCount)> GetAdminOrdersWithPagingAsync(
            string? status,
            DateTime? startDate,
            DateTime? endDate,
            string? keyword,
            int pageNumber,
            int pageSize,
            string? includeProperties = "User,Address")
        {
            IQueryable<Order> query = dbSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(includeProperties))
            {
                foreach (var includeProp in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp.Trim());
                }
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(o => o.CurrentStatus == status);
            }

            if (startDate.HasValue)
            {
                query = query.Where(o => o.OrderDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(o => o.OrderDate <= endDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var trimmedKeyword = keyword.Trim();
                bool isNumeric = int.TryParse(trimmedKeyword, out int numericKeyword);

                query = query.Where(o =>
                    (isNumeric && o.OrderId == numericKeyword) ||
                    (o.RecipientName != null && o.RecipientName.Contains(trimmedKeyword)) ||
                    (o.Phone != null && o.Phone.Contains(trimmedKeyword)) ||
                    (o.User != null && o.User.FullName != null && o.User.FullName.Contains(trimmedKeyword)) ||
                    (o.User != null && o.User.PhoneNumber != null && o.User.PhoneNumber.Contains(trimmedKeyword))
                );
            }

            var totalCount = await query.CountAsync();

            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (orders, totalCount);
        }
    }
}
