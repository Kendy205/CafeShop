using System;
using System.Threading.Tasks;
using CafeShop.DTO.Admin;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CafeShop.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    // [Authorize(Roles = CafeShop.Uitls.SystemRole.Admin)]
    public class DashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _dashboardService;

        public DashboardController(IAdminDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummaryMetrics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var summary = await _dashboardService.GetSummaryMetricsAsync(startDate, endDate);
                return Ok(ApiResponse<DashboardSummaryDto>.Succeeded(summary, 200, "Lấy tổng quan hệ thống thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopProducts([FromQuery] int top = 5, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var topProducts = await _dashboardService.GetTopProductsAsync(top, startDate, endDate);
                return Ok(ApiResponse<object>.Succeeded(topProducts, 200, "Lấy danh sách sản phẩm bán chạy thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("revenue-chart")]
        public async Task<IActionResult> GetRevenueChartData([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var chartData = await _dashboardService.GetRevenueChartDataAsync(startDate, endDate);
                return Ok(ApiResponse<object>.Succeeded(chartData, 200, "Lấy dữ liệu biểu đồ doanh thu thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }

        [HttpGet("order-stats")]
        public async Task<IActionResult> GetOrderStatusStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var stats = await _dashboardService.GetOrderStatusStatsAsync(startDate, endDate);
                return Ok(ApiResponse<object>.Succeeded(stats, 200, "Lấy thống kê trạng thái đơn hàng thành công!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Failed($"Lỗi hệ thống: {ex.Message}", 500));
            }
        }
    }
}
