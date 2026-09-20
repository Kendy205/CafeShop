using System.Collections.Generic;

namespace CafeShop.DTO.Admin
{
    public class DashboardSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int NewUsersCount { get; set; }
        public int TotalProductsSold { get; set; }
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int TotalSold { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class RevenueChartDto
    {
        public string Label { get; set; } = string.Empty; // e.g. "2026-09-01"
        public decimal Revenue { get; set; }
    }

    public class OrderStatusStatDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
