using System;
using System.Collections.Generic;

namespace CafeShop.DTO.Feedback.Responses
{
    public class AdminFeedbackResponseDto
    {
        public int FeedbackId { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? ProductImage { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserAvatar { get; set; }
        
        public int OrderId { get; set; } // Admin needs to know which order
        public int OrderDetailId { get; set; }
        public string? SizeName { get; set; }

        public int Rating { get; set; }
        public string? Comment { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsVisible { get; set; }

        public bool HasImages { get; set; }
        public bool IsReplied { get; set; }
    }

    public class AdminFeedbackDetailResponseDto : AdminFeedbackResponseDto
    {
        public List<string> Images { get; set; } = new List<string>();
        public FeedbackReplyDto? AdminReply { get; set; }
    }
}
