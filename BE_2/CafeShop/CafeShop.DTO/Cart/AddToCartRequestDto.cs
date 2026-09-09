using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Cart
{
    // DTO để Frontend gửi dữ liệu lên khi bấm "Thêm vào giỏ"
    public class AddToCartRequestDto
    {
        public int ProductId { get; set; }
        public int? SizeId { get; set; }
        public int Quantity { get; set; }
        public List<ToppingSelectionDto> Toppings { get; set; } = new List<ToppingSelectionDto>(); // Danh sách Topping khách chọn
    }
    public class ToppingSelectionDto
    {
        public int ToppingId { get; set; }
        public int Quantity { get; set; } // Khách truyền 200 (ml) hoặc 2 (trái)
    }

    // DTO để gửi thông tin Giỏ hàng về cho Frontend hiển thị
    public class CartResponseDto
    {
        public int CartId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; } // Tổng tiền cả giỏ
        public List<CartItemResponseDto> Items { get; set; } = new List<CartItemResponseDto>();
    }
    public class CartItemToppingDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
    public class CartItemResponseDto
    {
        public int CartItemId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? SizeName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } // Giá 1 ly (đã bao gồm size + topping)
        public decimal TotalItemPrice { get; set; } // Quantity * UnitPrice
        public List<CartItemToppingDto> Toppings { get; set; } = new List<CartItemToppingDto>();
    }
}
