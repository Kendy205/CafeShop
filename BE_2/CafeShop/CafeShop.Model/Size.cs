using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class Size
    {
        [Key]
        public int SizeId { get; set; }
        [Required]
        [StringLength(10)]
        public string Name { get; set; }
        [Required]
        [Range(0, 100)]
        public decimal PercentIncrease { get; set; }

        public virtual ICollection<ProductSize>? ProductSizes { get; set; }
    }
}
