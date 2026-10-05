using System.Collections.Generic;

namespace CafeShop.DTO.Dashboard
{
    public class DashboardSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int NewUsersCount { get; set; }
        public int TotalProductsSold { get; set; }
    }

    public class ProductSizeSalesDto
    {
        public int? SizeId { get; set; }
        public string SizeName { get; set; } = string.Empty;
        public int TotalSold { get; set; }
        public int StockQuantity { get; set; }
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? CategoryName { get; set; }
        public int StockQuantity { get; set; }
        public int TotalSold { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<ProductSizeSalesDto> SizeDetails { get; set; } = new();
    }

    public class TopCustomerDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
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
