using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class ProductTopping
    {
        public int ProductId { get; set; }
        public int ToppingId { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
        [ForeignKey("ToppingId")]
        public virtual Topping? Topping { get; set; }
    }
}
