using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Feedback;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Users;
using CafeShop.Uitls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Users
{
    public class FeedbackService : IFeedbackService // Nhớ tạo interface tương ứng nhé
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public FeedbackService(IUnitOfWork unitOfWork,IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task AddFeedbackAsync(int userId, CreateFeedbackDto request)
        {
            // 1. Tìm OrderDetail và Include bảng Order gốc để kiểm tra User & Trạng thái
            var orderDetail = await _unitOfWork.OrderDetail.GetFirstOrDefaultAsync(
                od => od.OrderDetailId == request.OrderDetailId,
                includeProperties: "Order"
            );

            if (orderDetail == null || orderDetail.Order == null)
                throw new ArgumentException("Chi tiết đơn hàng không tồn tại!");

            if (orderDetail.Order.CustomerId != userId)
                throw new ArgumentException("Bạn không có quyền đánh giá đơn hàng này!");

            // 2. Kiểm tra trạng thái đơn hàng (Phải là Completed)
            if (orderDetail.Order.CurrentStatus != OrderStatus.Completed)
                throw new ArgumentException("Chỉ có thể đánh giá những món đã giao thành công!");

            // 3. Đảm bảo ProductId FE gửi lên khớp với ProductId lưu trong OrderDetail
            if (orderDetail.ProductId != request.ProductId)
                throw new ArgumentException("Dữ liệu sản phẩm không khớp với hóa đơn!");

            // 4. CHỐNG SPAM MỚI: Check theo OrderDetailId
            var existingFeedback = await _unitOfWork.Feedback.GetFirstOrDefaultAsync(
                f => f.OrderDetailId == request.OrderDetailId);

            if (existingFeedback != null)
                throw new ArgumentException("Bạn đã đánh giá ly nước này rồi!");

            // 5. Lưu đánh giá
            var feedback = new Feedback
            {
                UserId = userId,
                ProductId = request.ProductId,
                OrderDetailId = request.OrderDetailId, // Lưu ID của dòng chi tiết
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Feedback.AddAsync(feedback);
            await _unitOfWork.SaveAsync();
        }
        // ================== LẤY DANH SÁCH ĐÁNH GIÁ (CÓ PHÂN TRANG) ==================
        public async Task<PagedResult<FeedbackResponseDto>> GetProductFeedbacksAsync(int productId, int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            // Lấy danh sách Feedback của món này, kèm theo thông tin User (để lấy tên hiển thị)
            var feedbacks = await _unitOfWork.Feedback.GetAllAsync(
                filter: f => f.ProductId == productId,
                includeProperties: "User", // Bắt buộc Include để AutoMapper lấy được Tên User
                orderBy: q => q.OrderByDescending(f => f.CreatedAt), // Mới nhất lên đầu
                pageNumber: pageNumber,
                pageSize: pageSize
            );

            var totalCount = await _unitOfWork.Feedback.CountAsync(f => f.ProductId == productId);
            var items = _mapper.Map<List<FeedbackResponseDto>>(feedbacks);

            return new PagedResult<FeedbackResponseDto>
            {
                Items = items,
                Total = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        // ================== THỐNG KÊ ĐIỂM SAO ==================
        public async Task<FeedbackSummaryDto> GetFeedbackSummaryAsync(int productId)
        {
            var feedbacks = await _unitOfWork.Feedback.GetAllAsync(f => f.ProductId == productId);

            var summary = new FeedbackSummaryDto
            {
                ProductId = productId,
                TotalReviews = feedbacks.Count()
            };

            if (summary.TotalReviews > 0)
            {
                // Tính điểm trung bình (Làm tròn 1 chữ số thập phân, vd: 4.5)
                summary.AverageRating = Math.Round(feedbacks.Average(f => f.Rating), 1);

                // Đếm chi tiết từng mức sao
                summary.FiveStarCount = feedbacks.Count(f => f.Rating == 5);
                summary.FourStarCount = feedbacks.Count(f => f.Rating == 4);
                summary.ThreeStarCount = feedbacks.Count(f => f.Rating == 3);
                summary.TwoStarCount = feedbacks.Count(f => f.Rating == 2);
                summary.OneStarCount = feedbacks.Count(f => f.Rating == 1);
            }

            return summary;
        }

    }
}
