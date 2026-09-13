using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class Address
    {
        [Key]
        public int AddressId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required(ErrorMessage = "Tên người nhận không được để trống")]
        [MaxLength(150)]
        public string RecipientName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        [Phone]
        [MaxLength(20)]
        public string? Phone { get; set; }
        [StringLength(500)]
        public string FullAddress { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
        public bool IsDeleted { get; set; } = false;
        public double Latitude { get; set; }  // Vĩ độ
        public double Longitude { get; set; } // Kinh độ
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        // ── Navigation Properties ──────────────────────────────
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
        public virtual ICollection<Order>? Orders { get; set; }
    }
}
