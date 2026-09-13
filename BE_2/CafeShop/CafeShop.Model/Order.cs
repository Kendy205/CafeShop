using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }
        public int CustomerId { get; set; }
        public int AddressId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        
        public string? PaymentMethod { get; set; }
 
        public string? CurrentStatus { get; set; }
        [StringLength(500)]
        public string? Note { get; set; } 

        public int? VoucherId { get; set; }
        public decimal DiscountAmount { get; set; }

        [ForeignKey("CustomerId")]
        public virtual User? Customer { get; set; }
        [ForeignKey("VoucherId")]
        public virtual Voucher? Voucher { get; set; }
        [ForeignKey("AddressId")]
        public virtual Address? Address { get; set; }
        public decimal ShippingFee { get; set; } // Phí ship
        public double DistanceKm { get; set; }   // Khoảng cách giao hàng
        public virtual ICollection<OrderDetail>? OrderDetails { get; set; }
      
        public virtual ICollection<OrderStatusHistory>? StatusHistories { get; set; }
    }
}
