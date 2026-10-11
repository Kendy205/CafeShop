using System.Collections.Generic;

namespace CafeShop.DTO.Cart.Responses
{
    public class CartItemResponseDto
    {
        public int CartItemId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int? SizeId { get; set; }
        public string? SizeName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalItemPrice { get; set; }
        public int StockQuantity { get; set; }
        public bool IsExceedStock => Quantity > StockQuantity;
        public List<CartItemToppingDto> Toppings { get; set; } = new();
    }
}
