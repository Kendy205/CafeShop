using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Feedback;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;

namespace CafeShop.Service.Service.Admin
{
    public class AdminFeedbackService : IAdminFeedbackService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminFeedbackService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PagedResult<AdminFeedbackResponseDto>> GetFeedbacksForManagementAsync(int? productId = null, int? rating = null, bool? isVisible = null, int pageNumber = 1, int pageSize = 10)
        {
            var query = _unitOfWork.Feedback.GetQueryable()
                .AsNoTracking()
                .Include(f => f.Product)
                .Include(f => f.User)
                .AsQueryable();

            if (productId.HasValue)
            {
                query = query.Where(f => f.ProductId == productId.Value);
            }

            if (rating.HasValue)
            {
                query = query.Where(f => f.Rating == rating.Value);
            }

            if (isVisible.HasValue)
            {
                query = query.Where(f => f.IsVisible == isVisible.Value);
            }

            int total = await query.CountAsync();

            var items = await query
                .OrderByDescending(f => f.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(f => new AdminFeedbackResponseDto
                {
                    FeedbackId = f.FeedbackId,
                    ProductId = f.ProductId,
                    ProductName = f.Product != null ? f.Product.Name : "N/A",
                    UserId = f.UserId,
                    UserName = f.User != null ? (f.User.FullName ?? f.User.Username) : "N/A",
                    OrderDetailId = f.OrderDetailId,
                    Rating = f.Rating,
                    Comment = f.Comment,
                    CreatedAt = f.CreatedAt,
                    IsVisible = f.IsVisible
                })
                .ToListAsync();

            return new PagedResult<AdminFeedbackResponseDto>
            {
                Items = items,
                Total = total,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task ToggleFeedbackVisibilityAsync(int feedbackId)
        {
            var feedback = await _unitOfWork.Feedback.GetFirstOrDefaultAsync(f => f.FeedbackId == feedbackId);
            if (feedback == null) throw new Exception("Không tìm thấy đánh giá");

            feedback.IsVisible = !feedback.IsVisible;
            _unitOfWork.Feedback.Update(feedback);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteFeedbackAsync(int feedbackId)
        {
            var feedback = await _unitOfWork.Feedback.GetFirstOrDefaultAsync(f => f.FeedbackId == feedbackId);
            if (feedback == null) throw new Exception("Không tìm thấy đánh giá");

            _unitOfWork.Feedback.Remove(feedback);
            await _unitOfWork.SaveAsync();
        }
    }
}
