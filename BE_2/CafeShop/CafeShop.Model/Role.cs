using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CafeShop.Model
{
    public class Role
    {
        [Key]
        public int RoleId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        
        [StringLength(255)]
        public string? Description { get; set; }

        public virtual ICollection<UserRole>? UserRoles { get; set; }
        public virtual ICollection<RolePermission>? RolePermissions { get; set; }
    }
}
