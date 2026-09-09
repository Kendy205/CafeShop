using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class Cart
    {
        [Key]
        [Column("cart_id")]
        public int CartId { get; set; } // Dùng int cho khớp với CafeShop

        [Column("user_id")]
        public int UserId { get; set; } // Dùng int cho khớp với CafeShop

        /// <summary>active | converted | abandoned</summary>
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "active";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // — Navigation Properties —
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
