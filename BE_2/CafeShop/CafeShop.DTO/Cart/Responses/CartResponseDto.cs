using System.Collections.Generic;

namespace CafeShop.DTO.Cart.Responses
{
    public class CartResponseDto
    {
        public int CartId { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public List<CartItemResponseDto> Items { get; set; } = new List<CartItemResponseDto>();
    }
}
