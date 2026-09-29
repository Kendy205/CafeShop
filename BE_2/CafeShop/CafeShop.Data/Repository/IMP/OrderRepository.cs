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

        public async Task<List<(Product Product, int TotalQuantity, decimal TotalRevenue)>> GetTopSellingProductsForAdminAsync(int top, DateTime? startDate, DateTime? endDate)
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

            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .ToListAsync();

            var result = new List<(Product Product, int TotalQuantity, decimal TotalRevenue)>();
            foreach (var item in topProducts)
            {
                var product = products.FirstOrDefault(p => p.ProductId == item.ProductId);
                if (product != null)
                {
                    result.Add((product, item.TotalQuantity, item.TotalRevenue));
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
    }
}
