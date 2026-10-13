using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CafeShop.Uitls;

namespace CafeShop.Model
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public int AddressId { get; set; }

        // --- Snapshot Thông tin giao hàng ---
        [StringLength(150)]
        public string? RecipientName { get; set; }
        [StringLength(20)]
        public string? Phone { get; set; }
        [StringLength(500)]
        public string? FullAddress { get; set; }

        public DateTime OrderDate { get; set; } = DateTimeHelper.VietnamNow;
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public string? PaymentMethod { get; set; } // Giữ lại cho tương thích ngược tạm thời

        [StringLength(50)]
        public string PaymentStatus { get; set; } = "UNPAID"; // UNPAID, PAID, REFUNDED, FAILED
 
        public string? CurrentStatus { get; set; }
        [StringLength(500)]
        public string? Note { get; set; } 

        public int? VoucherId { get; set; }
        public decimal OrderDiscount { get; set; }
        public decimal ShippingDiscount { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
        [ForeignKey("VoucherId")]
        public virtual Voucher? Voucher { get; set; }
        [ForeignKey("AddressId")]
        public virtual Address? Address { get; set; }

        public decimal ShippingFee { get; set; } // Phí ship
        public double DistanceKm { get; set; }   // Khoảng cách giao hàng
        public virtual ICollection<OrderDetail>? OrderDetails { get; set; }
        public virtual ICollection<OrderStatusHistory>? StatusHistories { get; set; }
        public virtual ICollection<Payment>? Payments { get; set; }
    }
}
