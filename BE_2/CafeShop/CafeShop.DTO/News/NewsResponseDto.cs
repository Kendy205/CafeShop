using System;

namespace CafeShop.DTO.News
{
    public class NewsResponseDto
    {
        public int NewsId { get; set; }
        public int UserId { get; set; }
        public string? AuthorName { get; set; } // Optional: Lấy từ bảng User
        
        public string? Title { get; set; }
        public string? Slug { get; set; }
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public string? Status { get; set; }
        
        public DateTime? ScheduledPublishAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int ViewCount { get; set; }
    }
}
