using System.Collections.Generic;

namespace CafeShop.DTO.Feedback.Responses
{
    public class FeedbackSummaryResponseDto
    {
        public int ProductId { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        
        public Dictionary<int, int> Distribution { get; set; } = new Dictionary<int, int>
        {
            { 5, 0 },
            { 4, 0 },
            { 3, 0 },
            { 2, 0 },
            { 1, 0 }
        };
    }
}
