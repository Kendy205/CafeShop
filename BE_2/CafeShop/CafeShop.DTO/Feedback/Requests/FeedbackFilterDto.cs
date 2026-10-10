namespace CafeShop.DTO.Feedback.Requests
{
    public class FeedbackFilterDto
    {
        public int? Rating { get; set; }
        public bool? HasImage { get; set; }
        public string SortBy { get; set; } = "newest"; // newest, oldest, highest, lowest
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
