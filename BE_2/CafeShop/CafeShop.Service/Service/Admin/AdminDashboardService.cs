using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Admin;
using CafeShop.Service.IService.Admin;
using CafeShop.Uitls;

namespace CafeShop.Service.Service.Admin
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminDashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<DashboardSummaryDto> GetSummaryMetricsAsync(DateTime? startDate, DateTime? endDate)
        {
            var users = await _unitOfWork.User.GetAllAsync();
            var orders = await _unitOfWork.Order.GetAllAsync(includeProperties: "OrderDetails");
            
            if (startDate.HasValue)
            {
                users = users.Where(u => u.CreatedAt >= startDate.Value).ToList();
                orders = orders.Where(o => o.OrderDate >= startDate.Value).ToList();
            }
            if (endDate.HasValue)
            {
                users = users.Where(u => u.CreatedAt <= endDate.Value).ToList();
                orders = orders.Where(o => o.OrderDate <= endDate.Value).ToList();
            }

            // Only count completed orders for revenue
            var completedOrders = orders.Where(o => o.CurrentStatus == "Completed" || o.CurrentStatus == "delivered").ToList();

            var summary = new DashboardSummaryDto
            {
                TotalRevenue = completedOrders.Sum(o => o.TotalAmount),
                TotalOrders = orders.Count(),
                NewUsersCount = users.Count(u => u.Role != SystemRole.Admin), // Assuming users are not admin
                TotalProductsSold = completedOrders.SelectMany(o => o.OrderDetails).Sum(od => od.Quantity)
            };

            return summary;
        }

        public async Task<List<TopProductDto>> GetTopProductsAsync(int top, DateTime? startDate, DateTime? endDate)
        {
            var orders = await _unitOfWork.Order.GetAllAsync(includeProperties: "OrderDetails,OrderDetails.Product");

            if (startDate.HasValue)
            {
                orders = orders.Where(o => o.OrderDate >= startDate.Value).ToList();
            }
            if (endDate.HasValue)
            {
                orders = orders.Where(o => o.OrderDate <= endDate.Value).ToList();
            }

            var completedOrders = orders.Where(o => o.CurrentStatus == "Completed" || o.CurrentStatus == "delivered").ToList();

            var allOrderDetails = completedOrders.SelectMany(o => o.OrderDetails).ToList();

            var topProducts = allOrderDetails
                .GroupBy(od => od.ProductId)
                .Select(g => new TopProductDto
                {
                    ProductId = g.Key,
                    ProductName = g.FirstOrDefault()?.Product?.Name ?? "Unknown",
                    TotalSold = g.Sum(od => od.Quantity),
                    TotalRevenue = g.Sum(od => od.UnitPrice * od.Quantity)
                })
                .OrderByDescending(p => p.TotalSold)
                .Take(top)
                .ToList();

            return topProducts;
        }

        public async Task<List<RevenueChartDto>> GetRevenueChartDataAsync(DateTime? startDate, DateTime? endDate)
        {
            var orders = await _unitOfWork.Order.GetAllAsync();

            if (startDate.HasValue)
            {
                orders = orders.Where(o => o.OrderDate >= startDate.Value).ToList();
            }
            if (endDate.HasValue)
            {
                orders = orders.Where(o => o.OrderDate <= endDate.Value).ToList();
            }

            var completedOrders = orders.Where(o => o.CurrentStatus == "Completed" || o.CurrentStatus == "delivered").ToList();

            var chartData = completedOrders
                .GroupBy(o => o.OrderDate.ToString("yyyy-MM-dd"))
                .Select(g => new RevenueChartDto
                {
                    Label = g.Key,
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(d => d.Label)
                .ToList();

            return chartData;
        }

        public async Task<List<OrderStatusStatDto>> GetOrderStatusStatsAsync(DateTime? startDate, DateTime? endDate)
        {
            var orders = await _unitOfWork.Order.GetAllAsync();

            if (startDate.HasValue)
            {
                orders = orders.Where(o => o.OrderDate >= startDate.Value).ToList();
            }
            if (endDate.HasValue)
            {
                orders = orders.Where(o => o.OrderDate <= endDate.Value).ToList();
            }

            var stats = orders
                .GroupBy(o => o.CurrentStatus)
                .Select(g => new OrderStatusStatDto
                {
                    Status = g.Key ?? "Unknown",
                    Count = g.Count()
                })
                .ToList();

            return stats;
        }
    }
}
