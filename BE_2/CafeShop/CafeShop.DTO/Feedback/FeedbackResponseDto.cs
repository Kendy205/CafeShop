using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Feedback
{
    public class CreateFeedbackDto
    {
        public int ProductId { get; set; }
        public int OrderDetailId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    // Dùng để trả danh sách đánh giá ra màn hình chi tiết món
    public class FeedbackResponseDto
    {
        public int FeedbackId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        // Thông tin người đánh giá (Ẩn bớt họ tên cho bảo mật nếu cần, Vd: T***)
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatar { get; set; }
    }
    public class FeedbackSummaryDto
    {
        public int ProductId { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; } // Ví dụ: 4.5

        // (Tùy chọn) Thống kê chi tiết có bao nhiêu cái 5 sao, 4 sao...
        public int FiveStarCount { get; set; }
        public int FourStarCount { get; set; }
        public int ThreeStarCount { get; set; }
        public int TwoStarCount { get; set; }
        public int OneStarCount { get; set; }
    }
}
