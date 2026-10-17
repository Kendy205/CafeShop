using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Order.Responses;
using CafeShop.DTO.Notifications;
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

        public async Task<PagedResult<OrderResponseDto>> GetAllOrdersAsync(int pageNumber, int pageSize, string? status = null, DateTime? startDate = null, DateTime? endDate = null, string? keyword = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            if (endDate.HasValue && endDate.Value.TimeOfDay == TimeSpan.Zero)
            {
                endDate = endDate.Value.Date.AddDays(1).AddTicks(-1);
            }

            var (orders, totalCount) = await _unitOfWork.Order.GetAdminOrdersWithPagingAsync(
                status: status,
                startDate: startDate,
                endDate: endDate,
                keyword: keyword,
                pageNumber: pageNumber,
                pageSize: pageSize,
                includeProperties: "User,Address"
            );
            var items = _mapper.Map<List<OrderResponseDto>>(orders);

            return new PagedResult<OrderResponseDto>
            {
                Items = items,
                Total = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<PagedResult<OrderResponseDto>> GetUserCompletedOrdersAsync(int userId, int pageNumber, int pageSize, DateTime? startDate = null, DateTime? endDate = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            if (endDate.HasValue && endDate.Value.TimeOfDay == TimeSpan.Zero)
            {
                endDate = endDate.Value.Date.AddDays(1).AddTicks(-1);
            }

            System.Linq.Expressions.Expression<Func<Order, bool>> filter = x =>
                x.UserId == userId && x.CurrentStatus == OrderStatus.Completed &&
                (!startDate.HasValue || x.OrderDate >= startDate.Value) &&
                (!endDate.HasValue || x.OrderDate <= endDate.Value);

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

                var currentStatus = order.CurrentStatus ?? OrderStatus.Pending;

                if (currentStatus == OrderStatus.Cancelled || currentStatus == OrderStatus.Completed)
                    throw new ArgumentException("Không thể thay đổi trạng thái của đơn hàng đã Hủy hoặc Hoàn thành!");

                // === STATE MACHINE PATTERN ===
                bool isValidTransition = OrderStatus.IsValidTransition(currentStatus, newStatus);

                if (!isValidTransition)
                {
                    throw new ArgumentException($"Sai quy trình! Không thể chuyển trực tiếp từ '{currentStatus}' sang '{newStatus}'.");
                }

                // Không cho phép xác nhận đơn thanh toán online khi khách chưa hoàn tất thanh toán
                if (!string.Equals(order.PaymentMethod, PaymentMethodConstants.COD, StringComparison.OrdinalIgnoreCase)
                    && !string.Equals(order.PaymentStatus, PaymentStatusConstants.Paid, StringComparison.OrdinalIgnoreCase)
                    && newStatus == OrderStatus.Confirmed)
                {
                    throw new InvalidOperationException("Đơn hàng thanh toán trực tuyến chưa hoàn tất thanh toán, không thể xác nhận đơn!");
                }

                if (newStatus == OrderStatus.Cancelled && string.IsNullOrWhiteSpace(cancelReason))
                {
                    throw new ArgumentException("Bắt buộc phải cung cấp lý do (CancelReason) khi Hủy đơn hàng!");
                }

                // Xử lý khi HỦY ĐƠN: Hoàn tồn kho, voucher, ghi chú và cập nhật hoàn tiền (nếu đã thanh toán)
                if (newStatus == OrderStatus.Cancelled)
                {
                    await RestoreStockAsync(order.OrderDetails);
                    await RestoreVoucherUsageAsync(order.UserId, order.VoucherId);

                    if (string.Equals(order.PaymentStatus, PaymentStatusConstants.Paid, StringComparison.OrdinalIgnoreCase))
                    {
                        order.PaymentStatus = PaymentStatusConstants.Refunded;
                    }

                    if (!string.IsNullOrWhiteSpace(cancelReason))
                    {
                        order.Note = string.IsNullOrWhiteSpace(order.Note)
                            ? $"[Lý do hủy: {cancelReason}]"
                            : $"{order.Note} | [Lý do hủy: {cancelReason}]";
                    }
                }

                // Nếu hoàn thành đơn hàng COD: tự động cập nhật trạng thái đã thanh toán và tạo bản ghi Payment
                if (newStatus == OrderStatus.Completed)
                {
                    if (string.Equals(order.PaymentMethod, PaymentMethodConstants.COD, StringComparison.OrdinalIgnoreCase)
                        && !string.Equals(order.PaymentStatus, PaymentStatusConstants.Paid, StringComparison.OrdinalIgnoreCase))
                    {
                        order.PaymentStatus = PaymentStatusConstants.Paid;

                        var codPayment = new Payment
                        {
                            OrderId = order.OrderId,
                            PaymentMethod = PaymentMethodConstants.COD,
                            PaymentProvider = PaymentMethodConstants.COD,
                            Amount = order.TotalAmount,
                            PaymentStatus = PaymentStatusConstants.PaymentSuccess,
                            PaidAt = DateTimeHelper.VietnamNow,
                            CreatedAt = DateTimeHelper.VietnamNow
                        };
                        await _unitOfWork.Payment.AddAsync(codPayment);
                    }
                }

                order.CurrentStatus = newStatus;
                _unitOfWork.Order.Update(order);
                
                string historyNote = newStatus == OrderStatus.Cancelled 
                                     ? $"Cửa hàng Hủy Đơn. Lý do: {cancelReason}" 
                                     : $"Cửa hàng chuyển trạng thái sang {newStatus}";
                await _historyService.AddHistoryAsync(order.OrderId, newStatus, adminId, historyNote);

                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();

                try
                {
                    // 1. Thông báo riêng cho khách hàng
                    await _signalRService.NotifyOrderStatusToUserAsync(order.UserId, order.OrderId, newStatus);

                    // 2. Thông báo tới nhóm quản lý đơn (Staff & Admin) để đồng bộ Live Kitchen Board
                    var actionUser = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == adminId);
                    string actionUserName = actionUser?.FullName ?? actionUser?.Username ?? "Nhân viên";
                    string statusVi = OrderStatus.ToVietnamese(newStatus);
                    string staffMsg = newStatus == OrderStatus.Cancelled
                        ? $"{actionUserName} đã hủy đơn hàng #{order.OrderId}. Lý do: {cancelReason ?? "Không có"}"
                        : $"{actionUserName} đã chuyển đơn hàng #{order.OrderId} sang trạng thái: {statusVi}.";

                    await _signalRService.NotifyOrderEventAsync(new OrderNotificationDto
                    {
                        OrderId = order.OrderId,
                        CustomerName = order.User?.FullName ?? "Khách hàng",
                        CustomerPhone = order.User?.PhoneNumber,
                        TotalAmount = order.TotalAmount,
                        PaymentMethod = order.PaymentMethod,
                        PaymentStatus = order.PaymentStatus,
                        OrderStatus = newStatus,
                        Message = staffMsg,
                        NotificationType = NotificationTypes.OrderStatusChanged,
                        ActionUserId = adminId,
                        ActionUserName = actionUserName,
                        CreatedAt = DateTimeHelper.VietnamNow
                    });
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

            var sizeDetails = orderDetails.Where(d => d.SizeId.HasValue && d.SizeId.Value > 0).ToList();
            var noSizeProductIds = orderDetails.Where(d => !d.SizeId.HasValue || d.SizeId.Value <= 0).Select(d => d.ProductId).Distinct().ToList();

            var productSizesDict = sizeDetails.Any()
                ? (await _unitOfWork.ProductSize.GetAllAsync(ps =>
                    sizeDetails.Select(d => d.ProductId).Contains(ps.ProductId) &&
                    sizeDetails.Select(d => d.SizeId!.Value).Contains(ps.SizeId)))
                    .ToDictionary(ps => (ps.ProductId, ps.SizeId))
                : new Dictionary<(int, int), ProductSize>();

            var productsDict = noSizeProductIds.Any()
                ? (await _unitOfWork.Product.GetAllAsync(p => noSizeProductIds.Contains(p.ProductId)))
                    .ToDictionary(p => p.ProductId)
                : new Dictionary<int, Product>();

            var allToppingIds = orderDetails
                .Where(d => d.OrderDetailToppings != null)
                .SelectMany(d => d.OrderDetailToppings!)
                .Select(t => t.ToppingId)
                .Distinct()
                .ToList();

            var toppingsDict = allToppingIds.Any()
                ? (await _unitOfWork.Topping.GetAllAsync(t => allToppingIds.Contains(t.ToppingId)))
                    .ToDictionary(t => t.ToppingId)
                : new Dictionary<int, Topping>();

            foreach (var detail in orderDetails)
            {
                int qty = detail.Quantity > 0 ? detail.Quantity : 1;

                if (detail.SizeId.HasValue && detail.SizeId.Value > 0)
                {
                    if (productSizesDict.TryGetValue((detail.ProductId, detail.SizeId.Value), out var productSize))
                    {
                        productSize.StockQuantity += qty;
                        _unitOfWork.ProductSize.Update(productSize);
                    }
                }
                else
                {
                    if (productsDict.TryGetValue(detail.ProductId, out var product))
                    {
                        product.StockQuantity += qty;
                        _unitOfWork.Product.Update(product);
                    }
                }

                if (detail.OrderDetailToppings == null)
                    continue;

                foreach (var toppingLine in detail.OrderDetailToppings)
                {
                    if (toppingsDict.TryGetValue(toppingLine.ToppingId, out var topping))
                    {
                        int toppingQty = toppingLine.Quantity > 0 ? toppingLine.Quantity : 1;
                        topping.StockQuantity += toppingQty * qty;
                        _unitOfWork.Topping.Update(topping);
                    }
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
