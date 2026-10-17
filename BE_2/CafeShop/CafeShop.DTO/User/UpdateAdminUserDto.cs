using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.User
{
    public class UpdateAdminUserDto
    {
        public string? FullName { get; set; }
        
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        public string? PhoneNumber { get; set; }
        
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string? Email { get; set; }

        public IFormFile? AvatarFile { get; set; }

        public List<int>? RoleIds { get; set; }

        public bool? IsActive { get; set; }

        [MinLength(6, ErrorMessage = "Mật khẩu mới tối thiểu 6 ký tự")]
        public string? NewPassword { get; set; }
    }
}
