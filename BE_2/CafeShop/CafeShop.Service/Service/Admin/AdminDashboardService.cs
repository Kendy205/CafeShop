using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;
using CafeShop.DTO.Product.Requests;
using CafeShop.DTO.Product.Responses;
using CafeShop.DTO.User;
using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard.Requests;
using CafeShop.DTO.Dashboard.Responses;
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

            // Feedback stats
            System.Linq.Expressions.Expression<Func<CafeShop.Model.Feedback, bool>> feedbackFilter = f =>
                (!startDate.HasValue || f.CreatedAt >= startDate.Value) &&
                (!endDate.HasValue || f.CreatedAt <= endDate.Value);
                
            var totalFeedbacks = await _unitOfWork.Feedback.CountAsync(feedbackFilter);
            
            double averageFeedbackRating = 0;
            if (totalFeedbacks > 0)
            {
                var feedbackQuery = _unitOfWork.Feedback.GetQueryable().Where(feedbackFilter);
                averageFeedbackRating = await feedbackQuery.AverageAsync(f => (double)f.Rating);
                averageFeedbackRating = Math.Round(averageFeedbackRating, 1);
            }

            var summary = new DashboardSummaryDto
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                NewUsersCount = newUsersCount,
                TotalProductsSold = totalProductsSold,
                TotalFeedbacks = totalFeedbacks,
                AverageFeedbackRating = averageFeedbackRating
            };

            return summary;
        }

        public async Task<List<TopProductDto>> GetTopProductsAsync(int top, DateTime? startDate, DateTime? endDate)
        {
            var topSellingProducts = await _unitOfWork.Order.GetTopSellingProductsForAdminAsync(top, startDate, endDate);

            var topProducts = topSellingProducts.Select(tp => 
            {
                var sizeDetails = new List<ProductSizeSalesDto>();
                int totalStock = 0;

                if (tp.Product.ProductSizes != null && tp.Product.ProductSizes.Any())
                {
                    foreach (var sizeSale in tp.SizeSales)
                    {
                        var ps = tp.Product.ProductSizes.FirstOrDefault(p => p.SizeId == sizeSale.SizeId);
                        sizeDetails.Add(new ProductSizeSalesDto
                        {
                            SizeId = sizeSale.SizeId,
                            SizeName = ps?.Size?.Name ?? "Mặc định",
                            TotalSold = sizeSale.Quantity,
                            StockQuantity = ps?.StockQuantity ?? 0
                        });
                    }
                    totalStock = tp.Product.ProductSizes.Sum(ps => ps.StockQuantity);
                }
                else
                {
                    // No size
                    sizeDetails.Add(new ProductSizeSalesDto
                    {
                        SizeId = null,
                        SizeName = "Mặc định",
                        TotalSold = tp.TotalQuantity,
                        StockQuantity = tp.Product.StockQuantity
                    });
                    totalStock = tp.Product.StockQuantity;
                }

                return new TopProductDto
                {
                    ProductId = tp.Product.ProductId,
                    ProductName = tp.Product.Name ?? "Unknown Product",
                    ImageUrl = tp.Product.ImageUrl,
                    CategoryName = tp.Product.Category?.Name,
                    StockQuantity = totalStock,
                    TotalSold = tp.TotalQuantity,
                    TotalRevenue = tp.TotalRevenue,
                    SizeDetails = sizeDetails
                };
            }).ToList();

            return topProducts;
        }

        public async Task<List<TopCustomerDto>> GetTopCustomersAsync(int top, DateTime? startDate, DateTime? endDate)
        {
            var topCustomers = await _unitOfWork.Order.GetTopCustomersForAdminAsync(top, startDate, endDate);

            var result = topCustomers.Select(tc => new TopCustomerDto
            {
                UserId = tc.User.UserId,
                Username = tc.User.Username ?? "Unknown",
                FullName = tc.User.FullName,
                AvatarUrl = tc.User.AvatarUrl,
                TotalOrders = tc.TotalOrders,
                TotalSpent = tc.TotalSpent
            }).ToList();

            return result;
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
