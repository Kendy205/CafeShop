using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Feedback.Requests;
using CafeShop.DTO.Feedback.Responses;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using CafeShop.Service.IService.Users;
using CafeShop.Uitls;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Users
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;

        public FeedbackService(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
        }

        public async Task<(bool IsSuccess, string Message, int? FeedbackId)> CreateFeedbackAsync(int userId, CreateFeedbackRequestDto request)
        {
            var orderDetail = await _unitOfWork.OrderDetail.GetFirstOrDefaultAsync(
                od => od.OrderDetailId == request.OrderDetailId,
                includeProperties: "Order,Product"
            );

            if (orderDetail == null || orderDetail.Order == null)
                return (false, "Chi tiết đơn hàng không tồn tại!", null);

            if (orderDetail.Order.UserId != userId)
                return (false, "Bạn không có quyền đánh giá đơn hàng này!", null);

            if (orderDetail.Order.CurrentStatus != OrderStatus.Completed)
                return (false, "Chỉ có thể đánh giá những món đã giao thành công!", null);

            bool exists = await _unitOfWork.Feedback.ExistsByOrderDetailIdAsync(request.OrderDetailId);
            if (exists)
                return (false, "Bạn đã đánh giá sản phẩm trong hóa đơn này rồi!", null);

            var feedback = new Feedback
            {
                UserId = userId,
                ProductId = orderDetail.ProductId, // Tự động lấy từ OrderDetail
                OrderDetailId = request.OrderDetailId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTimeHelper.VietnamNow,
                IsVisible = true
            };

            await _unitOfWork.Feedback.AddAsync(feedback);
            await _unitOfWork.SaveAsync();

            return (true, "Tạo đánh giá thành công.", feedback.FeedbackId);
        }

        public async Task<(bool IsSuccess, string Message)> UploadFeedbackImagesAsync(int userId, int feedbackId, List<IFormFile> files)
        {
            var feedback = await _unitOfWork.Feedback.GetFirstOrDefaultAsync(
                f => f.FeedbackId == feedbackId,
                includeProperties: "FeedbackImages"
            );

            if (feedback == null)
                return (false, "Không tìm thấy đánh giá!");

            if (feedback.UserId != userId)
                return (false, "Bạn không có quyền thêm ảnh vào đánh giá này!");

            if (files == null || files.Count == 0)
                return (false, "Vui lòng chọn ít nhất một hình ảnh.");

            int currentCount = feedback.FeedbackImages?.Count ?? 0;
            if (currentCount + files.Count > 5)
                return (false, $"Bạn chỉ được tải lên tối đa 5 hình ảnh. (Hiện tại: {currentCount}/5)");

            var uploadTasks = new List<Task<ImageUploadResult>>();
            foreach (var file in files)
            {
                // Validate size, extension if needed
                uploadTasks.Add(_photoService.AddPhotoAsync(file));
            }

            var results = await Task.WhenAll(uploadTasks);

            foreach (var result in results)
            {
                if (result.Error != null)
                    return (false, $"Lỗi khi tải ảnh lên: {result.Error.Message}");

                var feedbackImage = new FeedbackImage
                {
                    FeedbackId = feedbackId,
                    ImageUrl = result.SecureUrl.ToString(),
                    ImagePublicId = result.PublicId,
                    CreatedAt = DateTimeHelper.VietnamNow
                };
                await _unitOfWork.FeedbackImage.AddAsync(feedbackImage);
            }

            await _unitOfWork.SaveAsync();
            return (true, "Tải hình ảnh thành công.");
        }

        public async Task<(bool IsSuccess, string Message)> DeleteFeedbackImageAsync(int userId, int feedbackId, int imageId)
        {
            var feedbackImage = await _unitOfWork.FeedbackImage.GetFirstOrDefaultAsync(
                fi => fi.FeedbackImageId == imageId && fi.FeedbackId == feedbackId,
                includeProperties: "Feedback"
            );

            if (feedbackImage == null)
                return (false, "Không tìm thấy hình ảnh!");

            if (feedbackImage.Feedback == null || feedbackImage.Feedback.UserId != userId)
                return (false, "Bạn không có quyền xóa hình ảnh này!");

            if (!string.IsNullOrEmpty(feedbackImage.ImagePublicId))
            {
                var deletionResult = await _photoService.DeletePhotoAsync(feedbackImage.ImagePublicId);
                if (deletionResult.Error != null)
                {
                    return (false, $"Lỗi khi xóa ảnh trên Cloudinary: {deletionResult.Error.Message}");
                }
            }

            _unitOfWork.FeedbackImage.Remove(feedbackImage);
            await _unitOfWork.SaveAsync();

            return (true, "Đã xóa hình ảnh thành công.");
        }

        public async Task<(bool IsSuccess, string Message)> UpdateFeedbackAsync(int userId, int feedbackId, UpdateFeedbackRequestDto request)
        {
            var feedback = await _unitOfWork.Feedback.GetFirstOrDefaultAsync(f => f.FeedbackId == feedbackId);

            if (feedback == null)
                return (false, "Không tìm thấy đánh giá!");

            if (feedback.UserId != userId)
                return (false, "Bạn không có quyền sửa đánh giá này!");

            feedback.Rating = request.Rating;
            feedback.Comment = request.Comment;
            feedback.UpdatedAt = DateTimeHelper.VietnamNow;

            _unitOfWork.Feedback.Update(feedback);
            await _unitOfWork.SaveAsync();

            return (true, "Cập nhật đánh giá thành công.");
        }

        public async Task<(bool IsSuccess, string Message)> DeleteFeedbackAsync(int userId, int feedbackId)
        {
            var feedback = await _unitOfWork.Feedback.GetFirstOrDefaultAsync(f => f.FeedbackId == feedbackId);

            if (feedback == null)
                return (false, "Không tìm thấy đánh giá!");

            if (feedback.UserId != userId)
                return (false, "Bạn không có quyền xóa đánh giá này!");

            _unitOfWork.Feedback.Remove(feedback);
            await _unitOfWork.SaveAsync();

            return (true, "Đã xóa đánh giá.");
        }

        public async Task<PagedResult<FeedbackResponseDto>> GetProductFeedbacksAsync(int productId, FeedbackFilterDto filter)
        {
            if (filter.PageNumber < 1) filter.PageNumber = 1;
            if (filter.PageSize < 1) filter.PageSize = 10;

            var feedbacksQuery = await _unitOfWork.Feedback.GetAllAsNoTrackingAsync(
                f => f.ProductId == productId && f.IsVisible,
                includeProperties: "User,OrderDetail,OrderDetail.Size,FeedbackImages,FeedbackReply,FeedbackReply.AdminUser"
            );

            // Filtering
            if (filter.Rating.HasValue)
            {
                feedbacksQuery = feedbacksQuery.Where(f => f.Rating == filter.Rating.Value);
            }
            if (filter.HasImage.HasValue && filter.HasImage.Value)
            {
                feedbacksQuery = feedbacksQuery.Where(f => f.FeedbackImages != null && f.FeedbackImages.Any());
            }

            // Sorting
            feedbacksQuery = filter.SortBy?.ToLower() switch
            {
                "oldest" => feedbacksQuery.OrderBy(f => f.CreatedAt),
                "highest" => feedbacksQuery.OrderByDescending(f => f.Rating).ThenByDescending(f => f.CreatedAt),
                "lowest" => feedbacksQuery.OrderBy(f => f.Rating).ThenByDescending(f => f.CreatedAt),
                _ => feedbacksQuery.OrderByDescending(f => f.CreatedAt) // Default "newest"
            };

            int totalCount = feedbacksQuery.Count();
            
            var pagedData = feedbacksQuery
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToList();

            var items = pagedData.Select(f => new FeedbackResponseDto
            {
                FeedbackId = f.FeedbackId,
                Rating = f.Rating,
                Comment = f.Comment,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt,
                UserId = f.UserId,
                UserName = f.User?.FullName ?? f.User?.Username ?? "Khách hàng",
                UserAvatar = f.User?.AvatarUrl,
                ProductId = f.ProductId,
                ProductName = f.Product?.Name ?? "",
                SizeId = f.OrderDetail?.SizeId,
                SizeName = f.OrderDetail?.Size?.Name,
                Images = f.FeedbackImages?.Select(img => img.ImageUrl).ToList() ?? new List<string>(),
                AdminReply = f.FeedbackReply == null ? null : new FeedbackReplyDto
                {
                    ReplyContent = f.FeedbackReply.ReplyContent,
                    CreatedAt = f.FeedbackReply.CreatedAt,
                    AdminName = f.FeedbackReply.AdminUser?.FullName ?? "Admin"
                }
            }).ToList();

            return new PagedResult<FeedbackResponseDto>
            {
                Items = items,
                Total = totalCount,
                Page = filter.PageNumber,
                PageSize = filter.PageSize
            };
        }

        public async Task<FeedbackSummaryResponseDto> GetFeedbackSummaryAsync(int productId)
        {
            var summaryData = await _unitOfWork.Feedback.GetFeedbackSummaryForProductAsync(productId);

            var summary = new FeedbackSummaryResponseDto
            {
                ProductId = productId,
                TotalReviews = summaryData.TotalReviews,
                AverageRating = summaryData.TotalReviews > 0 ? Math.Round(summaryData.AverageRating, 1) : 0,
            };

            if (summary.TotalReviews > 0)
            {
                summary.Distribution[5] = summaryData.Five;
                summary.Distribution[4] = summaryData.Four;
                summary.Distribution[3] = summaryData.Three;
                summary.Distribution[2] = summaryData.Two;
                summary.Distribution[1] = summaryData.One;
            }

            return summary;
        }
    }
}
