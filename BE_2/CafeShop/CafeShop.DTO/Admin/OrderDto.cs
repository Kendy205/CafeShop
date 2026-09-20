using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Admin
{
    public class UpdateOrderStatusDto
    {
        [Required(ErrorMessage = "Trạng thái mới không được để trống")]
        public string NewStatus { get; set; } = string.Empty;
    }
}
