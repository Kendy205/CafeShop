using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Cart.Requests
{
    // DTO để Frontend gửi dữ liệu lên khi bấm "Thêm vào giỏ"
    public class AddToCartRequestDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public int ProductId { get; set; }
        public int? SizeId { get; set; }

        [System.ComponentModel.DataAnnotations.Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int Quantity { get; set; }
        public List<ToppingSelectionDto> Toppings { get; set; } = new List<ToppingSelectionDto>(); // Danh sách Topping khách chọn
    }
    public class ToppingSelectionDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public int ToppingId { get; set; }

        [System.ComponentModel.DataAnnotations.Range(1, int.MaxValue, ErrorMessage = "Số lượng topping phải lớn hơn 0")]
        public int Quantity { get; set; } // Khách truyền 200 (ml) hoặc 2 (trái)
    }
}
