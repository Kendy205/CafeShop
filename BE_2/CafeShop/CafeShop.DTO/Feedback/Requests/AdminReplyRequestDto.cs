using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Feedback.Requests
{
    public class AdminReplyRequestDto
    {
        [Required(ErrorMessage = "Nội dung phản hồi không được để trống")]
        [StringLength(1000, ErrorMessage = "Nội dung phản hồi không được vượt quá 1000 ký tự")]
        public string ReplyContent { get; set; } = string.Empty;
    }
}
