using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class OrderDetail
    {
        [Key]
        public int OrderDetailId { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int SizeId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Note { get; set; }

        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }
        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }
        [ForeignKey("SizeId")]
        public virtual Size? Size { get; set; }
        public virtual ICollection<Feedback>? Feedbacks { get; set; }
        public virtual ICollection<OrderDetailTopping>? OrderDetailToppings { get; set; }
    }
}
