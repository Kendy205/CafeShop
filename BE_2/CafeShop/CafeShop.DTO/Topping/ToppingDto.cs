using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Topping
{
    public class ToppingDto
    {
        public int ToppingId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Unit { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public int StockQuantity { get; set; } = 0;
        public bool IsOutOfStock => StockQuantity <= 0 || !IsAvailable;
        public string? ImageUrl { get; set; }
    }

    public class CreateUpdateToppingDto
    {
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Tên topping không được để trống")]
        [System.ComponentModel.DataAnnotations.MaxLength(50, ErrorMessage = "Tên topping tối đa 50 ký tự")]
        public string Name { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Range(0, double.MaxValue, ErrorMessage = "Giá không hợp lệ")]
        public decimal Price { get; set; }

        [System.ComponentModel.DataAnnotations.MaxLength(20, ErrorMessage = "Đơn vị tính tối đa 20 ký tự")]
        public string Unit { get; set; } = string.Empty; // ml, gram, phần...

        public bool IsAvailable { get; set; } = true;

        [System.ComponentModel.DataAnnotations.Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho không được âm")]
        public int StockQuantity { get; set; } = 0;
        
        // Thêm IFormFile để hỗ trợ upload ảnh từ form-data
        public Microsoft.AspNetCore.Http.IFormFile? ImageFile { get; set; }
    }
}
