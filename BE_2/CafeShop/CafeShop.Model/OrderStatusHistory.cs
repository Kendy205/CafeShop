using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class OrderStatusHistory
    {
        [Key]
        public int HistoryId { get; set; }
        public int OrderId { get; set; }
        [StringLength(500)]
        public string? Status { get; set; }
        public int ChangedBy { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string? Note { get; set; }

        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }
        [ForeignKey("ChangedBy")]
        public virtual User? UserAction { get; set; }
    }
}
