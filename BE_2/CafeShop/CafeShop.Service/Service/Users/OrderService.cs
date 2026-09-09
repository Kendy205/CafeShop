using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Order;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Users;
using CafeShop.Services.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CafeShop.Services.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IVoucherService _voucherService;
        private readonly IMapper _mapper;

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper, IVoucherService voucherService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _voucherService = voucherService;
        }

        // ================= XỬ LÝ ĐẶT HÀNG TỪ GIỎ HÀNG =================
        public async Task<OrderResponseDto> CheckoutAsync(int userId, CheckoutRequestDto request)
        {
            var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(
                c => c.UserId == userId && c.Status == "active",
                includeProperties: "CartItems.Product,CartItems.Size,CartItems.CartItemToppings.Topping"
            );

            if (cart == null || !cart.CartItems.Any()) throw new ArgumentException("Giỏ hàng trống!");

            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1. Xử lý địa chỉ & phí ship
                int finalAddressId = await ResolveAddressIdAsync(userId, request.AddressId, request.NewAddressString, request.RecipientName, request.Phone);
                decimal shippingFee = CalculateShippingFee(request.DistanceKm);

                // 2. Tính tổng tiền hàng
                var orderDetails = new List<OrderDetail>();
                decimal orderTotal = 0;

                foreach (var cartItem in cart.CartItems)
                {
                    // 1. Kiểm tra tồn kho Sản phẩm
                    if (cartItem.Product.StockQuantity < cartItem.Quantity)
                        throw new ArgumentException($"Sản phẩm '{cartItem.Product.Name}' chỉ còn {cartItem.Product.StockQuantity} phần trong kho!");

                    // Trừ kho Sản phẩm
                    cartItem.Product.StockQuantity -= cartItem.Quantity;
                    _unitOfWork.Product.Update(cartItem.Product);

                    // 2. Xử lý và kiểm tra tồn kho Topping
                    foreach (var cartTopping in cartItem.CartItemToppings)
                    {
                        int totalToppingNeeded = cartTopping.Quantity * cartItem.Quantity;
                        if (cartTopping.Topping.StockQuantity < totalToppingNeeded)
                            throw new ArgumentException($"Topping '{cartTopping.Topping.Name}' không đủ số lượng trong kho!");

                        // Trừ kho Topping
                        cartTopping.Topping.StockQuantity -= totalToppingNeeded;
                        _unitOfWork.Topping.Update(cartTopping.Topping);
                    }
                    var orderDetail = new OrderDetail
                    {
                        ProductId = cartItem.ProductId,
                        SizeId = cartItem.SizeId ?? 0,
                        Quantity = cartItem.Quantity,
                        UnitPrice = cartItem.UnitPrice,
                        OrderDetailToppings = cartItem.CartItemToppings.Select(t => new OrderDetailTopping
                        {
                            ToppingId = t.ToppingId,
                            Quantity = t.Quantity,
                            UnitPrice = t.UnitPrice
                        }).ToList()
                    };
                    orderTotal += (orderDetail.UnitPrice * orderDetail.Quantity);
                    orderDetails.Add(orderDetail);
                }

                // 3. Xử lý Voucher qua VoucherService
                decimal discountAmount = 0;
                int? voucherId = null;

                if (!string.IsNullOrEmpty(request.VoucherCode))
                {
                    var voucherResult = await _voucherService.ConsumeVoucherAsync(request.VoucherCode, userId, orderTotal, shippingFee);
                    voucherId = voucherResult.VoucherId;
                    discountAmount = voucherResult.DiscountAmount;
                }

                // 4. Lưu đơn hàng
                var order = new Order
                {
                    CustomerId = userId,
                    AddressId = finalAddressId,
                    DistanceKm = request.DistanceKm,
                    ShippingFee = shippingFee,
                    OrderDate = DateTime.UtcNow,
                    CurrentStatus = "Pending",
                    PaymentMethod = request.PaymentMethod ?? "COD",
                    Note = request.Note,
                    VoucherId = voucherId,
                    DiscountAmount = discountAmount,
                    TotalAmount = Math.Max(0, orderTotal + shippingFee - discountAmount),
                    OrderDetails = orderDetails
                };

                await _unitOfWork.Order.AddAsync(order);
                _unitOfWork.CartItem.RemoveRange(cart.CartItems);

                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();

                return _mapper.Map<OrderResponseDto>(order);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ================= API MUA NGAY (KHÔNG QUA GIỎ HÀNG) =================
        public async Task<OrderResponseDto> BuyNowAsync(int userId, CreateOrderDto request)
        {
            if (request.Items == null || !request.Items.Any())
                throw new ArgumentException("Vui lòng chọn ít nhất 1 sản phẩm để mua!");

            // 1. Tính toán trước ngoài Transaction
            var (orderDetails, orderTotal) = await BuildOrderDetailsFromItemsAsync(request.Items);

            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 2. Xử lý địa chỉ & phí ship
                int finalAddressId = await ResolveAddressIdAsync(userId, request.AddressId, request.NewAddressString, request.RecipientName, request.Phone);
                decimal shippingFee = CalculateShippingFee(request.DistanceKm);

                // 3. Xử lý Voucher qua VoucherService
                decimal discountAmount = 0;
                int? voucherId = null;

                if (!string.IsNullOrEmpty(request.VoucherCode))
                {
                    var voucherResult = await _voucherService.ConsumeVoucherAsync(request.VoucherCode, userId, orderTotal, shippingFee);
                    voucherId = voucherResult.VoucherId;
                    discountAmount = voucherResult.DiscountAmount;
                }

                // 4. Lưu đơn hàng
                var order = new Order
                {
                    CustomerId = userId,
                    AddressId = finalAddressId,
                    DistanceKm = request.DistanceKm,
                    ShippingFee = shippingFee,
                    OrderDate = DateTime.UtcNow,
                    CurrentStatus = "Pending",
                    PaymentMethod = request.PaymentMethod ?? "COD",
                    Note = request.Note,
                    VoucherId = voucherId,
                    DiscountAmount = discountAmount,
                    TotalAmount = Math.Max(0, orderTotal + shippingFee - discountAmount),
                    OrderDetails = orderDetails
                };

                await _unitOfWork.Order.AddAsync(order);
                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();

                return _mapper.Map<OrderResponseDto>(order);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ================= LẤY LỊCH SỬ ĐƠN HÀNG =================
        public async Task<PagedResult<OrderResponseDto>> GetMyOrdersAsync(int userId, int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var orders = await _unitOfWork.Order.GetAllAsync(
                filter: x => x.CustomerId == userId,
                includeProperties: "OrderDetails.Product,OrderDetails.Size,OrderDetails.OrderDetailToppings.Topping",
                pageSize: pageSize,
                pageNumber: pageNumber,
                orderBy: q => q.OrderByDescending(o => o.OrderDate)
            );

            var totalCount = await _unitOfWork.Order.CountAsync(x => x.CustomerId == userId);
            var items = _mapper.Map<List<OrderResponseDto>>(orders);

            return new PagedResult<OrderResponseDto>
            {
                Items = items,
                Total = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        // ================= HỦY ĐƠN HÀNG =================
        public async Task CancelOrderAsync(int userId, int orderId)
        {
            var order = await _unitOfWork.Order.GetFirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == userId);

            if (order == null)
                throw new ArgumentException("Không tìm thấy đơn hàng!");

            if (order.CurrentStatus?.ToLower() == "cancelled")
                throw new ArgumentException("Đơn hàng này đã được hủy trước đó.");

            if (order.CurrentStatus?.ToLower() != "pending")
                throw new ArgumentException("Quán đã bắt đầu pha chế món của bạn, không thể hủy đơn!");

            order.CurrentStatus = "Cancelled";

            _unitOfWork.Order.Update(order);
            await _unitOfWork.SaveAsync();
        }

        // ================= CÁC HÀM HELPER DÙNG CHUNG =================
        private decimal CalculateShippingFee(double distanceKm)
        {
            if (distanceKm <= 0) return 0;
            if (distanceKm <= 3) return 15000;

            decimal extraKm = (decimal)Math.Ceiling(distanceKm - 3);
            return 15000 + (extraKm * 5000);
        }

        private async Task<int> ResolveAddressIdAsync(int userId, int? addressId, string? newAddressString, string? recipientName, string? phone)
        {
            if (addressId.HasValue && addressId.Value > 0)
            {
                var address = await _unitOfWork.Address.GetFirstOrDefaultAsync(a => a.AddressId == addressId.Value && a.UserId == userId);
                if (address == null) throw new ArgumentException("Địa chỉ giao hàng không hợp lệ!");
                return address.AddressId;
            }

            if (!string.IsNullOrEmpty(newAddressString))
            {
                var newAddress = new Address
                {
                    UserId = userId,
                    FullAddress = newAddressString,
                    RecipientName = recipientName ?? "Khách hàng",
                    Phone = phone ?? "",
                    IsDefault = false
                };
                await _unitOfWork.Address.AddAsync(newAddress);
                await _unitOfWork.SaveAsync();
                return newAddress.AddressId;
            }

            throw new ArgumentException("Vui lòng chọn hoặc nhập địa chỉ giao hàng!");
        }

        private async Task<(List<OrderDetail> details, decimal total)> BuildOrderDetailsFromItemsAsync(List<CreateOrderDetailDto> items)
        {
            decimal total = 0;
            var details = new List<OrderDetail>();

            foreach (var item in items)
            {
                int qty = item.Quantity > 0 ? item.Quantity : 1;
                var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == item.ProductId);
                if (product == null || !product.IsAvailable)
                    throw new ArgumentException($"Sản phẩm có ID {item.ProductId} không tồn tại hoặc đã ngừng bán!");
                if (product.StockQuantity < qty)
                    throw new ArgumentException($"Sản phẩm '{product.Name}' chỉ còn {product.StockQuantity} phần, không đủ số lượng bạn đặt!");
                decimal unitPrice = product.BasePrice;

                if (item.SizeId.HasValue)
                {
                    var sizeInfo = await _unitOfWork.Size.GetFirstOrDefaultAsync(s => s.SizeId == item.SizeId.Value);
                    if (sizeInfo != null && sizeInfo.PercentIncrease > 0)
                        unitPrice += product.BasePrice * (sizeInfo.PercentIncrease / 100m);
                }

                var orderDetailToppings = new List<OrderDetailTopping>();
                if (item.Toppings != null && item.Toppings.Any())
                {
                    foreach (var top in item.Toppings)
                    {
                        var toppingInfo = await _unitOfWork.Topping.GetFirstOrDefaultAsync(t => t.ToppingId == top.ToppingId);
                        if (toppingInfo != null && toppingInfo.IsAvailable)
                        {
                            int totalToppingNeeded = top.Quantity * qty;
                            if (toppingInfo.StockQuantity < totalToppingNeeded)
                                throw new ArgumentException($"Topping '{toppingInfo.Name}' chỉ còn {toppingInfo.StockQuantity} phần, không đủ cho đơn của bạn!");
                            decimal toppingPrice = (decimal)(toppingInfo.Price ?? 0) * top.Quantity;
                            unitPrice += toppingPrice;

                            orderDetailToppings.Add(new OrderDetailTopping
                            {
                                ToppingId = toppingInfo.ToppingId,
                                Quantity = top.Quantity,
                                UnitPrice = toppingPrice
                            });
                        }
                    }
                }

                //int qty = item.Quantity > 0 ? item.Quantity : 1;
                details.Add(new OrderDetail
                {
                    ProductId = item.ProductId,
                    SizeId = item.SizeId ?? 0,
                    Quantity = qty,
                    UnitPrice = unitPrice,
                    OrderDetailToppings = orderDetailToppings
                });

                total += (unitPrice * qty);
            }

            return (details, total);
        }
    }
}