using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.User
{
    public class AssignRolesRequestDto
    {
        [Required]
        public List<int> RoleIds { get; set; } = new List<int>();
    }
}
