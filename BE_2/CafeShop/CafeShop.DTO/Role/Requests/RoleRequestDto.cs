using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Role.Requests
{
    public class RoleRequestDto
    {
        [Required(ErrorMessage = "Tên vai trò không được để trống")]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public List<int> PermissionIds { get; set; } = new List<int>();
    }
}
