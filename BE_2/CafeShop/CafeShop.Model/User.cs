using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CafeShop.Uitls;

namespace CafeShop.Model
{
    public class User
    {
        [Key]
        public int UserId { get; set; }
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;
    
        [StringLength(100)]
        public string? FullName { get; set; }

        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        [StringLength(100)]
        [EmailAddress]
        public string? Email { get; set; }

        [StringLength(500)]
        public string? AvatarUrl { get; set; }

        [StringLength(100)]
        public string? AvatarPublicId { get; set; }

        [StringLength(255)]
        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiryTime { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTimeHelper.VietnamNow;
        public DateTime? UpdatedAt { get; set; }
        public virtual ICollection<Order>? Orders { get; set; }
        public virtual ICollection<Feedback>? Feedbacks { get; set; }
        public virtual ICollection<Address>? Addresses { get; set; }
        public virtual Cart? Cart { get; set; }
        public virtual ICollection<UserRole>? UserRoles { get; set; }
    }
}
