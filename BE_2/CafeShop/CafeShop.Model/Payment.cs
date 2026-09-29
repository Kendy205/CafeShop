using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CafeShop.Model
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        public int OrderId { get; set; }

        /// <summary>Ví dụ: COD | VNPay | Momo</summary>
        [MaxLength(30)]
        public string PaymentMethod { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? PaymentProvider { get; set; }

        [MaxLength(100)]
        public string? TransactionCode { get; set; }

        public decimal Amount { get; set; }

        /// <summary>pending | success | failed | refunded</summary>
        [MaxLength(20)]
        public string PaymentStatus { get; set; } = "pending";

        public DateTime? PaidAt { get; set; }
        

        [MaxLength(500)]
        public string? ErrorMessage { get; set; } // Ghi chú nguyên nhân lỗi nếu giao dịch thất bại

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ── Navigation Properties ──────────────────────────────
        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }
    }
}
