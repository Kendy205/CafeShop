using CafeShop.Uitls;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using static System.Net.Mime.MediaTypeNames;

namespace CafeShop.Model
{
    public class Voucher
    {
        [Key]
        public int VoucherId { get; set; }
        public string? Code { get; set; }
        public string Description { get; set; } = string.Empty;

        // 1. Áp dụng cho ai: "PUBLIC" hoặc "USER"
        public string TargetType { get; set; } = VoucherTypeTarget.PUBLIC;

        // 2. Giảm vào cái gì: "Order" (tiền nước) hoặc "Shipping" (tiền ship)
        public string ApplyType { get; set; } = VoucherApplyType.ORDER;
        public string? DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal MaxDiscountAmount { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
    }
    
}
