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
        public int ProductId { get; set; }
        public int? SizeId { get; set; }
        public int Quantity { get; set; }
        public List<ToppingSelectionDto> Toppings { get; set; } = new List<ToppingSelectionDto>(); // Danh sách Topping khách chọn
    }
    public class ToppingSelectionDto
    {
        public int ToppingId { get; set; }
        public int Quantity { get; set; } // Khách truyền 200 (ml) hoặc 2 (trái)
    }
}
