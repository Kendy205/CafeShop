namespace CafeShop.DTO.Cart.Responses
{
    public class CartItemToppingDto
    {
        public int ToppingId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? Unit { get; set; }
        public string? ImageUrl { get; set; }
        public int StockQuantity { get; set; }
    }
}
