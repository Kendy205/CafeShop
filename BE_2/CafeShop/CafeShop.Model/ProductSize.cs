using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class ProductSize
    {
        public int ProductId { get; set; }
        public int SizeId { get; set; }
        public decimal? Price { get; set; }
        [ConcurrencyCheck] 
        public int StockQuantity { get; set; } = 0;

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
        [ForeignKey("SizeId")]
        public virtual Size? Size { get; set; }
    }
}
