using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Order;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using CafeShop.Service.IService.Notifications;
using CafeShop.Service.IService.Users;
using CafeShop.Uitls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Admin
{
    public class AdminOrderService : IAdminOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ISignalRService _signalRService;
        private readonly IOrderStatusHistoryService _historyService;

        public AdminOrderService(IUnitOfWork unitOfWork, IMapper mapper, ISignalRService signalRService, IOrderStatusHistoryService historyService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _signalRService = signalRService;
            _historyService = historyService;
        }

        public async Task<PagedResult<OrderResponseDto>> GetAllOrdersAsync(int pageNumber, int pageSize, string? status = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            System.Linq.Expressions.Expression<Func<Order, bool>> filter = x =>
                string.IsNullOrEmpty(status) || x.CurrentStatus == status;

            var orders = await _unitOfWork.Order.GetAllAsync(
                filter: filter,
                includeProperties: "User,Address",
                pageSize: pageSize,
                pageNumber: pageNumber,
                orderBy: q => q.OrderByDescending(o => o.OrderDate)
            );

            var totalCount = await _unitOfWork.Order.CountAsync(filter);
            var items = _mapper.Map<List<OrderResponseDto>>(orders);

            return new PagedResult<OrderResponseDto>
            {
                Items = items,
                Total = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<OrderResponseDto> GetOrderDetailsAsync(int orderId)
        {
            var order = await _unitOfWork.Order.GetFirstOrDefaultAsync(
                o => o.OrderId == orderId,
                includeProperties: "OrderDetails.Product,OrderDetails.Size,OrderDetails.OrderDetailToppings.Topping,OrderDetails.Feedbacks,User,Address"
            );

            if (order == null)
                throw new ArgumentException("Không tìm thấy đơn hàng!");

            return _mapper.Map<OrderResponseDto>(order);
        }

        public async Task UpdateOrderStatusAsync(int adminId, int orderId, string newStatus, string? cancelReason = null)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var order = await _unitOfWork.Order.GetFirstOrDefaultAsync(
                    o => o.OrderId == orderId,
                    includeProperties: "OrderDetails.OrderDetailToppings"
                );

                if (order == null)
                    throw new ArgumentException("Không tìm thấy đơn hàng!");

                var currentStatus = order.CurrentStatus;

                if (currentStatus == OrderStatus.Cancelled || currentStatus == OrderStatus.Completed)
                    throw new ArgumentException("Không thể thay đổi trạng thái của đơn hàng đã Hủy hoặc Hoàn thành!");

                // === STATE MACHINE PATTERN ===
                bool isValidTransition = OrderStatus.IsValidTransition(currentStatus, newStatus);

                if (!isValidTransition)
                {
                    throw new ArgumentException($"Sai quy trình! Không thể chuyển trực tiếp từ '{currentStatus}' sang '{newStatus}'.");
                }

                if (newStatus == OrderStatus.Cancelled && string.IsNullOrWhiteSpace(cancelReason))
                {
                    throw new ArgumentException("Bắt buộc phải cung cấp lý do (CancelReason) khi Hủy đơn hàng!");
                }

                // Nếu admin chuyển trạng thái sang Hủy/Từ chối thì phải refund
                if (newStatus == OrderStatus.Cancelled)
                {
                    await RestoreStockAsync(order.OrderDetails);
                    await RestoreVoucherUsageAsync(order.UserId, order.VoucherId);
                }

                order.CurrentStatus = newStatus;
                if (newStatus == OrderStatus.Cancelled)
                {
                    // Lưu lý do hủy vào order.Note tạm thời hoặc cần thêm CancelReason vào DB sau (tuỳ nhu cầu sau này)
                    // Tạm thời sẽ ghi vào HistoryService.
                }

                _unitOfWork.Order.Update(order);
                
                string historyNote = newStatus == OrderStatus.Cancelled 
                                     ? $"Admin Hủy Đơn. Lý do: {cancelReason}" 
                                     : $"Admin chuyển trạng thái sang {newStatus}";
                await _historyService.AddHistoryAsync(order.OrderId, newStatus, adminId, historyNote);

                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();

                try
                {
                    await _signalRService.NotifyOrderStatusToUserAsync(order.UserId, order.OrderId, newStatus);
                }
                catch { /* Ignore notification error */ }
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task RestoreStockAsync(ICollection<OrderDetail>? orderDetails)
        {
            if (orderDetails == null || !orderDetails.Any())
                return;

            foreach (var detail in orderDetails)
            {
                int qty = detail.Quantity > 0 ? detail.Quantity : 1;

                if (detail.SizeId > 0)
                {
                    var productSize = await _unitOfWork.ProductSize.GetFirstOrDefaultAsync(
                        ps => ps.ProductId == detail.ProductId && ps.SizeId == detail.SizeId
                    );

                    if (productSize != null)
                    {
                        productSize.StockQuantity += qty;
                        _unitOfWork.ProductSize.Update(productSize);
                    }
                }
                else
                {
                    var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == detail.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity += qty;
                        _unitOfWork.Product.Update(product);
                    }
                }

                if (detail.OrderDetailToppings == null)
                    continue;

                foreach (var toppingLine in detail.OrderDetailToppings)
                {
                    var topping = await _unitOfWork.Topping.GetFirstOrDefaultAsync(t => t.ToppingId == toppingLine.ToppingId);
                    if (topping == null)
                        continue;

                    int toppingQty = toppingLine.Quantity > 0 ? toppingLine.Quantity : 1;
                    topping.StockQuantity += toppingQty * qty;
                    _unitOfWork.Topping.Update(topping);
                }
            }
        }

        private async Task RestoreVoucherUsageAsync(int userId, int? voucherId)
        {
            if (!voucherId.HasValue || voucherId.Value <= 0)
                return;

            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.VoucherId == voucherId.Value);
            if (voucher == null)
                return;

            if (voucher.UsedCount > 0)
            {
                voucher.UsedCount -= 1;
                _unitOfWork.Voucher.Update(voucher);
            }

            if (!VoucherTypeTarget.IsUser(voucher.TargetType))
                return;

            var userVoucher = await _unitOfWork.UserVoucher.GetFirstOrDefaultAsync(
                uv => uv.UserId == userId && uv.VoucherId == voucher.VoucherId
            );

            if (userVoucher != null && userVoucher.UsedCount > 0)
            {
                userVoucher.UsedCount -= 1;
                _unitOfWork.UserVoucher.Update(userVoucher);
            }
        }
    }
}
