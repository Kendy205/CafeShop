using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Admin
{
    public class CreateUpdateProductDto
    {
        [Required(ErrorMessage = "Tên món không được để trống")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá không hợp lệ")]
        public decimal BasePrice { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public string? Description { get; set; }

        public bool IsAvailable { get; set; } = true;

        public int StockQuantity { get; set; } = 0;

        // Image
        public IFormFile? ImageFile { get; set; }

        // Mảng JSON hoặc form field cấu hình Sizes
        // Trong FormData, việc gửi mảng phức tạp hơi khó. 
        // Thường chúng ta sẽ gửi chuỗi JSON rồi deserialize ở Backend.
        public string? ProductSizesJson { get; set; }
    }

    public class CreateProductSizeDto
    {
        public int SizeId { get; set; }
        public decimal? Price { get; set; }
        public int StockQuantity { get; set; } = 0;
    }
}
