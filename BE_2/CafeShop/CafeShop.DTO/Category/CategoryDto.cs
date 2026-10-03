using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Category
{
    public class CategoryDto
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
