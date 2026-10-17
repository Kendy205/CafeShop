using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Role.Requests
{
    public class RoleRequestDto
    {
        [Required(ErrorMessage = "Tên vai trò không được để trống")]
        [MaxLength(50, ErrorMessage = "Tên vai trò tối đa 50 ký tự")]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(255, ErrorMessage = "Mô tả tối đa 255 ký tự")]
        public string? Description { get; set; }
        
        public List<int> PermissionIds { get; set; } = new List<int>();
    }
}
