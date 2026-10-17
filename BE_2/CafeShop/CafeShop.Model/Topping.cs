using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue)]
        public decimal? Price { get; set; }

        [StringLength(20)]
        public string Unit { get; set; } = string.Empty; // Ví dụ: "ml", "g", "trái", "phần"

        [StringLength(500)]
        public string? ImageUrl { get; set; }

        [ConcurrencyCheck]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; } = 0;

        public bool IsAvailable { get; set; } = true;
        public virtual ICollection<ProductTopping>? ProductToppings { get; set; }
    }
}
