namespace CafeShop.DTO.Product.Requests
{
    public class CreateProductSizeDto
    {
        public int SizeId { get; set; }
        public decimal? Price { get; set; }
        public int StockQuantity { get; set; } = 0;
    }
}
