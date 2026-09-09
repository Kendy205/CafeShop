using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class Topping
    {
        [Key]
        public int ToppingId { get; set; }
        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        public decimal? Price { get; set; }
        [StringLength(20)]
        public string Unit { get; set; } // Ví dụ: "ml", "g", "trái", "phần"
        public string? ImageUrl { get; set; }
        [ConcurrencyCheck]
        public int StockQuantity { get; set; } = 0; // Thêm dòng này

        public bool IsAvailable { get; set; } = true;
    }
}
