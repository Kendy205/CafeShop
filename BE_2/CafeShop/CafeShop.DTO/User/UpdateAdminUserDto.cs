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
    }
}
