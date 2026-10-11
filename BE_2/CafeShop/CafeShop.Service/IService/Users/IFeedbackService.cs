using CafeShop.DTO.Feedback.Requests;
using CafeShop.DTO.Feedback.Responses;
using CafeShop.Service.Helpers;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Users
{
    public interface IFeedbackService
    {
        Task<(bool IsSuccess, string Message, int? FeedbackId)> CreateFeedbackAsync(int userId, CreateFeedbackRequestDto request);
        Task<(bool IsSuccess, string Message)> UploadFeedbackImagesAsync(int userId, int feedbackId, List<Microsoft.AspNetCore.Http.IFormFile> files);
        Task<(bool IsSuccess, string Message)> DeleteFeedbackImageAsync(int userId, int feedbackId, int imageId);
        
        Task<(bool IsSuccess, string Message)> UpdateFeedbackAsync(int userId, int feedbackId, UpdateFeedbackRequestDto request);
        Task<(bool IsSuccess, string Message)> DeleteFeedbackAsync(int userId, int feedbackId);

        Task<PagedResult<FeedbackResponseDto>> GetProductFeedbacksAsync(int productId, FeedbackFilterDto filter);
        Task<FeedbackSummaryResponseDto> GetFeedbackSummaryAsync(int productId);
    }
}
