namespace CafeShop.DTO.Role.Responses
{
    public class PermissionDto
    {
        public int PermissionId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
