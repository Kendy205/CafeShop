using System;

namespace CafeShop.DTO.Feedback
{
    public class AdminFeedbackResponseDto
    {
        public int FeedbackId { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public int OrderDetailId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsVisible { get; set; }
    }
}
