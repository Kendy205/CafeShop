namespace CafeShop.DTO.Order.Responses
{
    public class OrderItemToppingDto
    {
        public int ToppingId { get; set; }
        public string ToppingName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Unit { get; set; }
        public string? ImageUrl { get; set; }
    }
}
