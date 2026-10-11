using System.Collections.Generic;

namespace CafeShop.DTO.Order.Responses
{
    public class OrderDetailDto
    {
        public int OrderDetailId { get; set; } // KHÓA QUAN TRỌNG: Dùng để gửi Feedback
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int? SizeId { get; set; }
        public string? SizeName { get; set; }
        public int Quantity { get; set; }

        public bool IsReviewed { get; set; } // FE check cờ này để hiện/ẩn nút Đánh giá

        public decimal UnitPrice { get; set; }
        public decimal TotalItemPrice => Quantity * UnitPrice;

        public List<OrderItemToppingDto> Toppings { get; set; } = new();
    }
}
