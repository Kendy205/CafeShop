using System;
using System.Collections.Generic;

namespace CafeShop.DTO.Feedback.Responses
{
    public class FeedbackResponseDto
    {
        public int FeedbackId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // User info
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserAvatar { get; set; }

        // Product info
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;

        // Size info (from OrderDetail)
        public int? SizeId { get; set; }
        public string? SizeName { get; set; }

        // Images
        public List<string> Images { get; set; } = new List<string>();

        // Reply
        public FeedbackReplyDto? AdminReply { get; set; }
    }

    public class FeedbackReplyDto
    {
        public string ReplyContent { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string AdminName { get; set; } = string.Empty;
    }
}
