using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Feedback.Requests
{
    public class UpdateFeedbackRequestDto
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Đánh giá phải từ 1 đến 5 sao")]
        public int Rating { get; set; }

        [StringLength(500)]
        public string? Comment { get; set; }
    }
}
