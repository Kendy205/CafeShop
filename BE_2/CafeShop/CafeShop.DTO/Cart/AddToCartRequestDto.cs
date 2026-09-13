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
        public int ToppingId { get; set; } // Bổ sung ID để Frontend dễ map
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? Unit { get; set; }
        public string? ImageUrl { get; set; }

        // Bổ sung tồn kho của Topping
        public int StockQuantity { get; set; }
    }
    public class CartItemResponseDto
    {
        public int CartItemId { get; set; }

        // 1. Bổ sung thông tin Product
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }

        // 2. Bổ sung thông tin Size
        public int? SizeId { get; set; }
        public string? SizeName { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalItemPrice { get; set; }

        // 3. Tồn kho của Size (hoặc của Product gốc nếu không có Size)
        public int StockQuantity { get; set; }

        // Trợ thủ cho Frontend: Báo đỏ nếu khách nhét vào giỏ nhiều hơn số ly còn lại
        public bool IsExceedStock => Quantity > StockQuantity;

        public List<CartItemToppingDto> Toppings { get; set; } = new();
    }
}
