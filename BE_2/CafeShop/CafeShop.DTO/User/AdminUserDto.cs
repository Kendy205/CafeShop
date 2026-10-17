using System;
using System.Collections.Generic;

namespace CafeShop.DTO.User
{
    public class AdminUserDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public List<int> RoleIds { get; set; } = new List<int>();
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
