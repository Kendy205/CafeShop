using System.Threading.Tasks;
using CafeShop.DTO.Feedback;
using CafeShop.Service.Helpers;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminFeedbackService
    {
        Task<PagedResult<AdminFeedbackResponseDto>> GetFeedbacksForManagementAsync(int? productId = null, int? rating = null, bool? isVisible = null, int pageNumber = 1, int pageSize = 10);
        Task ToggleFeedbackVisibilityAsync(int feedbackId);
        Task DeleteFeedbackAsync(int feedbackId);
    }
}
