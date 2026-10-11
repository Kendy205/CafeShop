using System;

namespace CafeShop.DTO.News.Responses
{
    public class NewsListResponseDto
    {
        public int NewsId { get; set; }
        public string? Title { get; set; }
        public string? Slug { get; set; }
        public string? Summary { get; set; }
        public string? ImageUrl { get; set; }
        public string? Status { get; set; }
        
        public string? AuthorName { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ViewCount { get; set; }
    }
}
