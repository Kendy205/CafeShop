using CafeShop.Uitls;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class Voucher
    {
        [Key]
        public int VoucherId { get; set; }

        [Required]
        [StringLength(50)]
        public string? Code { get; set; }

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        // 1. Áp dụng cho ai: "PUBLIC" hoặc "USER"
        [StringLength(20)]
        public string TargetType { get; set; } = VoucherTypeTarget.PUBLIC;

        // 2. Giảm vào cái gì: "Order" (tiền nước) hoặc "Shipping" (tiền ship)
        [StringLength(20)]
        public string ApplyType { get; set; } = VoucherApplyType.ORDER;

        [StringLength(20)]
        public string? DiscountType { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue)]
        public decimal DiscountValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue)]
        public decimal MinOrderValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue)]
        public decimal MaxDiscountAmount { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Range(0, int.MaxValue)]
        public int UsageLimit { get; set; }

        [ConcurrencyCheck]
        [Range(0, int.MaxValue)]
        public int UsedCount { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
    }
    
}
