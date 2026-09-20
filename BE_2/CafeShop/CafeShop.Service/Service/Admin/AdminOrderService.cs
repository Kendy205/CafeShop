using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Order;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
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

        public AdminOrderService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
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

        public async Task UpdateOrderStatusAsync(int orderId, string newStatus)
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

                if (order.CurrentStatus == OrderStatus.Cancelled || order.CurrentStatus == OrderStatus.Completed)
                    throw new ArgumentException("Không thể thay đổi trạng thái của đơn hàng đã Hủy hoặc Hoàn thành!");

                // Nếu admin chuyển trạng thái sang Hủy/Từ chối thì phải refund
                if (newStatus == OrderStatus.Cancelled)
                {
                    await RestoreStockAsync(order.OrderDetails);
                    await RestoreVoucherUsageAsync(order.UserId, order.VoucherId);
                }

                order.CurrentStatus = newStatus;
                _unitOfWork.Order.Update(order);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();
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
