using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Feedback.Requests;
using CafeShop.DTO.Feedback.Responses;
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

        public async Task<PagedResult<AdminFeedbackResponseDto>> GetFeedbacksForManagementAsync(AdminFeedbackFilterDto filter)
        {
            if (filter.PageNumber < 1) filter.PageNumber = 1;
            if (filter.PageSize < 1) filter.PageSize = 10;

            var query = _unitOfWork.Feedback.GetQueryable()
                .AsNoTracking()
                .Include(f => f.Product)
                .Include(f => f.User)
                .Include(f => f.OrderDetail)
                .Include(f => f.OrderDetail.Size)
                .Include(f => f.FeedbackImages)
                .Include(f => f.FeedbackReply)
                .AsQueryable();

            if (filter.ProductId.HasValue)
                query = query.Where(f => f.ProductId == filter.ProductId.Value);

            if (filter.Rating.HasValue)
                query = query.Where(f => f.Rating == filter.Rating.Value);

            if (filter.IsVisible.HasValue)
                query = query.Where(f => f.IsVisible == filter.IsVisible.Value);

            if (filter.HasImages.HasValue)
            {
                if (filter.HasImages.Value)
                    query = query.Where(f => f.FeedbackImages != null && f.FeedbackImages.Any());
                else
                    query = query.Where(f => f.FeedbackImages == null || !f.FeedbackImages.Any());
            }

            if (filter.IsReplied.HasValue)
            {
                if (filter.IsReplied.Value)
                    query = query.Where(f => f.FeedbackReply != null);
                else
                    query = query.Where(f => f.FeedbackReply == null);
            }

            // Sorting
            query = filter.SortBy?.ToLower() switch
            {
                "oldest" => query.OrderBy(f => f.CreatedAt),
                "highest" => query.OrderByDescending(f => f.Rating).ThenByDescending(f => f.CreatedAt),
                "lowest" => query.OrderBy(f => f.Rating).ThenByDescending(f => f.CreatedAt),
                _ => query.OrderByDescending(f => f.CreatedAt) // Default "newest"
            };

            int total = await query.CountAsync();

            var items = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(f => new AdminFeedbackResponseDto
                {
                    FeedbackId = f.FeedbackId,
                    ProductId = f.ProductId,
                    ProductName = f.Product != null ? f.Product.Name : "N/A",
                    UserId = f.UserId,
                    UserName = f.User != null ? (f.User.FullName ?? f.User.Username) : "N/A",
                    UserAvatar = f.User != null ? f.User.AvatarUrl : null,
                    OrderId = f.OrderDetail != null ? f.OrderDetail.OrderId : 0,
                    OrderDetailId = f.OrderDetailId,
                    SizeName = f.OrderDetail != null && f.OrderDetail.Size != null ? f.OrderDetail.Size.Name : "N/A",
                    Rating = f.Rating,
                    Comment = f.Comment,
                    CreatedAt = f.CreatedAt,
                    UpdatedAt = f.UpdatedAt,
                    IsVisible = f.IsVisible,
                    HasImages = f.FeedbackImages != null && f.FeedbackImages.Any(),
                    IsReplied = f.FeedbackReply != null
                })
                .ToListAsync();

            return new PagedResult<AdminFeedbackResponseDto>
            {
                Items = items,
                Total = total,
                Page = filter.PageNumber,
                PageSize = filter.PageSize
            };
        }

        public async Task<AdminFeedbackDetailResponseDto?> GetFeedbackDetailAsync(int feedbackId)
        {
            var f = await _unitOfWork.Feedback.GetQueryable()
                .AsNoTracking()
                .Include(f => f.Product)
                .Include(f => f.User)
                .Include(f => f.OrderDetail)
                .Include(f => f.OrderDetail.Size)
                .Include(f => f.FeedbackImages)
                .Include(f => f.FeedbackReply)
                .Include(f => f.FeedbackReply.AdminUser)
                .FirstOrDefaultAsync(f => f.FeedbackId == feedbackId);

            if (f == null) return null;

            return new AdminFeedbackDetailResponseDto
            {
                FeedbackId = f.FeedbackId,
                ProductId = f.ProductId,
                ProductName = f.Product != null ? f.Product.Name : "N/A",
                UserId = f.UserId,
                UserName = f.User != null ? (f.User.FullName ?? f.User.Username) : "N/A",
                UserAvatar = f.User != null ? f.User.AvatarUrl : null,
                OrderId = f.OrderDetail != null ? f.OrderDetail.OrderId : 0,
                OrderDetailId = f.OrderDetailId,
                SizeName = f.OrderDetail != null && f.OrderDetail.Size != null ? f.OrderDetail.Size.Name : "N/A",
                Rating = f.Rating,
                Comment = f.Comment,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
                IsVisible = f.IsVisible,
                HasImages = f.FeedbackImages != null && f.FeedbackImages.Any(),
                IsReplied = f.FeedbackReply != null,
                Images = f.FeedbackImages?.Select(img => img.ImageUrl).ToList() ?? new System.Collections.Generic.List<string>(),
                AdminReply = f.FeedbackReply == null ? null : new FeedbackReplyDto
                {
                    ReplyContent = f.FeedbackReply.ReplyContent,
                    CreatedAt = f.FeedbackReply.CreatedAt,
                    AdminName = f.FeedbackReply.AdminUser?.FullName ?? "Admin"
                }
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

        public async Task ReplyToFeedbackAsync(int adminUserId, int feedbackId, string replyContent)
        {
            var feedback = await _unitOfWork.Feedback.GetFirstOrDefaultAsync(f => f.FeedbackId == feedbackId);
            if (feedback == null) throw new Exception("Không tìm thấy đánh giá");

            var existingReply = await _unitOfWork.FeedbackReply.GetFirstOrDefaultAsync(r => r.FeedbackId == feedbackId);
            if (existingReply != null)
            {
                // Update existing reply
                existingReply.ReplyContent = replyContent;
                existingReply.AdminUserId = adminUserId;
                existingReply.CreatedAt = DateTime.UtcNow; // Or keep old and add UpdatedAt, but usually replies can just update date
                _unitOfWork.FeedbackReply.Update(existingReply);
            }
            else
            {
                // Create new reply
                var reply = new CafeShop.Model.FeedbackReply
                {
                    FeedbackId = feedbackId,
                    AdminUserId = adminUserId,
                    ReplyContent = replyContent,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.FeedbackReply.AddAsync(reply);
            }

            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteReplyAsync(int adminUserId, int feedbackId)
        {
            var existingReply = await _unitOfWork.FeedbackReply.GetFirstOrDefaultAsync(r => r.FeedbackId == feedbackId);
            if (existingReply == null) throw new Exception("Đánh giá này chưa có phản hồi để xóa");

            // Option: Only allow the admin who replied to delete, or any admin? Let's allow any admin to delete since they are all admins.
            _unitOfWork.FeedbackReply.Remove(existingReply);
            await _unitOfWork.SaveAsync();
        }
    }
}
