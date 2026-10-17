using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class Product
    {
        [Key]
        public int ProductId { get; set; }
        [Required]
        public int CategoryId { get; set; }
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue)]
        public decimal BasePrice { get; set; }

        [StringLength(500)]
        public string? ImageUrl { get; set; }

        [StringLength(100)]
        public string? ImagePublicId { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        public bool IsAvailable { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        [ConcurrencyCheck]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; } = 0;
        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }
        public virtual ICollection<ProductSize>? ProductSizes { get; set; }
        public virtual ICollection<ProductTopping>? ProductToppings { get; set; }
        public virtual ICollection<Feedback>? Feedbacks { get; set; }
    }
}
