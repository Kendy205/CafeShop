namespace CafeShop.DTO.Product.Responses
{
    public class ProductAutocompleteDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public decimal BasePrice { get; set; }
    }
}
