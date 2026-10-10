using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Feedback.Requests
{
    public class AdminFeedbackFilterDto
    {
        public int? ProductId { get; set; }
        public int? Rating { get; set; }
        public bool? IsVisible { get; set; }
        public bool? HasImages { get; set; }
        public bool? IsReplied { get; set; }
        public string? SortBy { get; set; } // newest, oldest, highest, lowest

        [Range(1, int.MaxValue)]
        public int PageNumber { get; set; } = 1;

        [Range(1, 100)]
        public int PageSize { get; set; } = 10;
    }
}
