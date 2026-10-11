using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryMetricsAsync(DateTime? startDate, DateTime? endDate);
        Task<List<TopProductDto>> GetTopProductsAsync(int top, DateTime? startDate, DateTime? endDate);
        Task<List<TopCustomerDto>> GetTopCustomersAsync(int top, DateTime? startDate, DateTime? endDate);
        Task<List<RevenueChartDto>> GetRevenueChartDataAsync(DateTime? startDate, DateTime? endDate);
        Task<List<OrderStatusStatDto>> GetOrderStatusStatsAsync(DateTime? startDate, DateTime? endDate);
    }
}
