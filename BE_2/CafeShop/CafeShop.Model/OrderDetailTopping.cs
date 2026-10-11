using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class OrderDetailTopping
    {
        [Key]
        public int Id { get; set; }
        public int OrderDetailId { get; set; }
        public int ToppingId { get; set; }
        public int Quantity { get; set; } = 1; 
        public decimal UnitPrice { get; set; } 
        [ForeignKey("OrderDetailId")]
        public virtual OrderDetail? OrderDetail { get; set; }
        [ForeignKey("ToppingId")]
        public virtual Topping? Topping { get; set; }
    }
}
