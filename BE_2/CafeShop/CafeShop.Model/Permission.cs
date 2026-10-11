using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CafeShop.Model
{
    public class Permission
    {
        [Key]
        public int PermissionId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Code { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Module { get; set; }
        
        [StringLength(255)]
        public string? Description { get; set; }

        public virtual ICollection<RolePermission>? RolePermissions { get; set; }
    }
}
