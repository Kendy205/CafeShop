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
            var totalRevenue = await _unitOfWork.Order.GetTotalRevenueAsync(startDate, endDate);
            var totalProductsSold = await _unitOfWork.Order.GetTotalProductsSoldAsync(startDate, endDate);
            
            System.Linq.Expressions.Expression<Func<CafeShop.Model.Order, bool>> orderFilter = o => 
                (!startDate.HasValue || o.OrderDate >= startDate.Value) &&
                (!endDate.HasValue || o.OrderDate <= endDate.Value);
            var totalOrders = await _unitOfWork.Order.CountAsync(orderFilter);

            // Đếm user mới trong khoảng thời gian (Loại trừ Admin qua bảng UserRoles)
            System.Linq.Expressions.Expression<Func<CafeShop.Model.User, bool>> userFilter = u =>
                !u.UserRoles!.Any(ur => ur.Role != null && ur.Role.Name == SystemRole.Admin) &&
                (!startDate.HasValue || u.CreatedAt >= startDate.Value) &&
                (!endDate.HasValue || u.CreatedAt <= endDate.Value);
            var newUsersCount = await _unitOfWork.User.CountAsync(userFilter);

            var summary = new DashboardSummaryDto
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                NewUsersCount = newUsersCount,
                TotalProductsSold = totalProductsSold
            };

            return summary;
        }

        public async Task<List<TopProductDto>> GetTopProductsAsync(int top, DateTime? startDate, DateTime? endDate)
        {
            var topSellingProducts = await _unitOfWork.Order.GetTopSellingProductsForAdminAsync(top, startDate, endDate);

            var topProducts = topSellingProducts.Select(tp => new TopProductDto
            {
                ProductId = tp.Product.ProductId,
                ProductName = tp.Product.Name ?? "Unknown Product",
                TotalSold = tp.TotalQuantity,
                TotalRevenue = tp.TotalRevenue
            }).ToList();

            return topProducts;
        }

        public async Task<List<RevenueChartDto>> GetRevenueChartDataAsync(DateTime? startDate, DateTime? endDate)
        {
            var chartData = await _unitOfWork.Order.GetRevenueChartDataAsync(startDate, endDate);
            
            return chartData.Select(c => new RevenueChartDto
            {
                Label = c.Label,
                Revenue = c.Revenue
            }).ToList();
        }

        public async Task<List<OrderStatusStatDto>> GetOrderStatusStatsAsync(DateTime? startDate, DateTime? endDate)
        {
            var stats = await _unitOfWork.Order.GetOrderStatusStatsAsync(startDate, endDate);

            return stats.Select(s => new OrderStatusStatDto
            {
                Status = s.Status,
                Count = s.Count
            }).ToList();
        }
    }
}
