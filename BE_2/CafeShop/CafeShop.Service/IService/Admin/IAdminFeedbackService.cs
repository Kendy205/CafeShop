using System.Threading.Tasks;
using CafeShop.DTO.Feedback.Requests;
using CafeShop.DTO.Feedback.Responses;
using CafeShop.Service.Helpers;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminFeedbackService
    {
        Task<PagedResult<AdminFeedbackResponseDto>> GetFeedbacksForManagementAsync(AdminFeedbackFilterDto filter);
        Task<AdminFeedbackDetailResponseDto?> GetFeedbackDetailAsync(int feedbackId);
        Task ToggleFeedbackVisibilityAsync(int feedbackId);
        Task DeleteFeedbackAsync(int feedbackId);
        Task ReplyToFeedbackAsync(int adminUserId, int feedbackId, string replyContent);
        Task DeleteReplyAsync(int adminUserId, int feedbackId);
    }
}
