using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Category.Requests
{
    public class UpdateCategoryDto
    {
        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        [MaxLength(100, ErrorMessage = "Tên danh mục tối đa 100 ký tự")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "Mô tả tối đa 500 ký tự")]
        public string? Description { get; set; }
    }
}
