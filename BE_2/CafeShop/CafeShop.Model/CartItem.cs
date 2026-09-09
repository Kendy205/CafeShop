using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class CartItem
    {
        [Key]
        [Column("cart_item_id")]
        public int CartItemId { get; set; }

        [Column("cart_id")]
        public int CartId { get; set; }

        [Column("product_id")]
        public int ProductId { get; set; }

        // Mở rộng thêm cho quán Cafe: Nếu khách chọn Size (S, M, L)
        // Nếu hiện tại chưa làm tới Size, bạn có thể comment dòng này lại
        [Column("size_id")]
        public int? SizeId { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        // Cực kỳ quan trọng: Lưu lại giá tiền tại thời điểm thêm vào giỏ.
        // Đề phòng hôm sau quán tăng giá thì giỏ hàng cũ của khách không bị đổi giá loạn xạ.
        [Column("unit_price")]
        public decimal UnitPrice { get; set; }

        // — Navigation Properties —
        [ForeignKey(nameof(CartId))]
        public virtual Cart Cart { get; set; } = null!;

        [ForeignKey(nameof(ProductId))]
        public virtual Product Product { get; set; } = null!;

        // Navigation Property cho Size (nếu bạn dùng SizeId ở trên)
        [ForeignKey(nameof(SizeId))]
        public virtual Size? Size { get; set; }
        public virtual ICollection<CartItemTopping> CartItemToppings { get; set; } = new List<CartItemTopping>();
    }
}
