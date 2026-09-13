using CafeShop.DTO.Feedback;
using CafeShop.Service.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Users
{
    public interface IFeedbackService
    {
        Task AddFeedbackAsync(int userId, CreateFeedbackDto request);
        // Lấy danh sách đánh giá của 1 món (Dùng cho FE cuộn/phân trang)
        Task<PagedResult<FeedbackResponseDto>> GetProductFeedbacksAsync(int productId, int pageNumber, int pageSize);

        // Lấy thống kê đánh giá (Điểm trung bình, tổng số lượt)
        Task<FeedbackSummaryDto> GetFeedbackSummaryAsync(int productId);
    }
}
