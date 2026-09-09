using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    [Table("cart_item_toppings")]
    public class CartItemTopping
    {
        [Key]
        [Column("cart_item_topping_id")]
        public int CartItemToppingId { get; set; }

        [Column("cart_item_id")]
        public int CartItemId { get; set; }

        [Column("topping_id")]
        public int ToppingId { get; set; }
        // MỚI: Số lượng topping khách chọn (Ví dụ: 200)
        public int Quantity { get; set; } = 1;
        // Lưu ý: Giá ở đây sẽ là = Topping.Price * Quantity
        [Column("unit_price")]
        public decimal UnitPrice { get; set; }

        // — Navigation Properties —
        [ForeignKey(nameof(CartItemId))]
        public virtual CartItem CartItem { get; set; } = null!;

        [ForeignKey(nameof(ToppingId))]
        public virtual Topping Topping { get; set; } = null!; // Giả sử bạn đã có Model Topping
    }
}
