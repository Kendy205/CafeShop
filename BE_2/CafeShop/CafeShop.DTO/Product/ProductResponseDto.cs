using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Product
{
    public class ProductResponseDto
    {
        public int ProductId { get; set; }
        public string? Name { get; set; }
        public decimal BasePrice { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImagePublicId { get; set; }
        public string? CategoryName { get; set; }
        public bool IsAvailable { get; set; }
        public int StockQuantity { get; set; }
        public string? Description { get; set; }

        public List<ProductSizeDto> ProductSizes { get; set; } = new List<ProductSizeDto>();
        public int TotalStock => ProductSizes != null && ProductSizes.Any()
            ? ProductSizes.Sum(s => s.StockQuantity)
            : StockQuantity;

        // Cờ cho Frontend hiển thị chữ "Hết Hàng" đè lên ảnh
        public bool IsOutOfStock => TotalStock <= 0 || !IsAvailable;
    }
    public class ProductSizeDto
    {
        public int SizeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int StockQuantity { get; set; } = 0;
        public bool IsOutOfStock => StockQuantity <= 0 ;
        public decimal Price { get; set; } // Đây là giá đã cộng % để FE hiển thị
    }
    public class CreateProductDto
    {
        [Required]
        public string? Name { get; set; }
        [Required]
        public decimal BasePrice { get; set; }
        public int CategoryId { get; set; }
        public int StockQuantity { get; set; } = 0;
        public string? Description { get; set; }
    }
}
