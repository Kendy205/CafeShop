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
        public string Name { get; set; }
        [Required]
      
        public decimal BasePrice { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImagePublicId { get; set; }
        public string? Description { get; set; }
        public bool IsAvailable { get; set; } = true;
        [ConcurrencyCheck]
        public int StockQuantity { get; set; } = 0; // Thêm dòng này
        [ForeignKey("CategoryId")]
        public virtual Category? Category { get; set; }
        public virtual ICollection<ProductSize>? ProductSizes { get; set; }
        public virtual ICollection<Feedback>? Feedbacks { get; set; }
    }
}
