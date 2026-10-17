using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CafeShop.Uitls;

namespace CafeShop.Model
{
    public class Cart
    {
        [Key]
        public int CartId { get; set; } // Dùng int cho khớp với CafeShop

        public int UserId { get; set; } // Dùng int cho khớp với CafeShop

        /// <summary>active | converted | abandoned</summary>
        [MaxLength(20)]
        public string Status { get; set; } = CafeShop.Uitls.CartStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTimeHelper.VietnamNow;

        public DateTime UpdatedAt { get; set; } = DateTimeHelper.VietnamNow;

        // — Navigation Properties —
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
