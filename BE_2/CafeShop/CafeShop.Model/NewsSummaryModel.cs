using System;

namespace CafeShop.Model
{
    public class NewsSummaryModel
    {
        public int NewsId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ViewCount { get; set; }

        public string? AuthorName { get; set; }
    }
}
