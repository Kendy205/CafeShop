using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Product.Requests
{
    public class CreateUpdateProductDto
    {
        [Required(ErrorMessage = "Tên món không được để trống")]
        [MaxLength(200, ErrorMessage = "Tên món không được vượt quá 200 ký tự")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá không hợp lệ")]
        public decimal BasePrice { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [MaxLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }

        public bool IsAvailable { get; set; } = true;

        [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho không được âm")]
        public int StockQuantity { get; set; } = 0;

        // Image
        public IFormFile? ImageFile { get; set; }

        // Mảng JSON hoặc form field cấu hình Sizes
        public string? ProductSizesJson { get; set; }
        
        // Mảng JSON cho Toppings. Chứa List<int> các ToppingId
        public string? ProductToppingsJson { get; set; }
    }
}
