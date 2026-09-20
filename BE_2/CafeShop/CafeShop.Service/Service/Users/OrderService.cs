using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Order;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using CafeShop.Service.IService.Users;
using CafeShop.Services.IServices;
using CafeShop.Uitls;
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
        private readonly IShippingService _shippingService;
        private readonly IMapper _mapper;

        // Tọa độ quán của bạn (Dùng để kiểm tra chống hack phí ship)
        private const double CAFE_LAT = 21.0285;
        private const double CAFE_LNG = 105.8542;

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper, IVoucherService voucherService, IShippingService shippingService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _voucherService = voucherService;
            _shippingService = shippingService;
        }

        // ================= XỬ LÝ ĐẶT HÀNG (GỘP CHUNG MUA NGAY & TỪ GIỎ HÀNG) =================
        public async Task<OrderResponseDto> SubmitOrderAsync(int userId, SubmitOrderRequestDto request)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                List<OrderDetail> orderDetails;
                decimal orderTotal = 0;
                Cart? cartToClear = null;

                // 1. RẼ NHÁNH XỬ LÝ MÓN ĂN & TRỪ KHO DỰA VÀO CỜ IsBuyNow
                if (request.IsBuyNow)
                {
                    if (request.Items == null || !request.Items.Any())
                        throw new ArgumentException("Vui lòng chọn ít nhất 1 sản phẩm để mua!");

                    var result = await BuildOrderDetailsFromItemsAsync(request.Items);
                    orderDetails = result.details;
                    orderTotal = result.total;
                }
                else
                {
                    var result = await BuildOrderDetailsFromCartAsync(userId);
                    orderDetails = result.details;
                    orderTotal = result.total;
                    cartToClear = result.cart;
                }

                // 2. BẢO MẬT: KIỂM TRA TÍNH TOÀN VẸN CỦA KHOẢNG CÁCH GIAO HÀNG (CHỐNG HACK)
                await ValidateDistanceIntegrityAsync(request.DistanceKm, request.AddressId, request.Latitude, request.Longitude, userId);

                // 3. XỬ LÝ ĐỊA CHỈ & TÍNH PHÍ SHIP
                int finalAddressId = await ResolveAddressIdAsync(
                    userId,
                    request.AddressId,
                    request.NewAddressString,
                    request.RecipientName,
                    request.Phone,
                    request.Latitude,
                    request.Longitude);

                // Truyền orderTotal vào để Service tự xét xem có được Freeship không
                decimal shippingFee = await _shippingService.CalculateFeeAsync(request.DistanceKm, orderTotal);

                // 4. XỬ LÝ VOUCHER KHUYẾN MÃI
                decimal discountAmount = 0;
                int? voucherId = null;

                if (!string.IsNullOrEmpty(request.VoucherCode))
                {
                    var voucherResult = await _voucherService.ConsumeVoucherAsync(request.VoucherCode, userId, orderTotal, shippingFee);
                    voucherId = voucherResult.VoucherId;
                    discountAmount = voucherResult.DiscountAmount;
                }

                // 5. LƯU ĐƠN HÀNG VÀO DATABASE
                var order = new Order
                {
                    UserId = userId,
                    AddressId = finalAddressId,
                    DistanceKm = request.DistanceKm,
                    ShippingFee = shippingFee,
                    OrderDate = DateTime.UtcNow,
                    CurrentStatus = OrderStatus.Pending,
                    PaymentMethod = request.PaymentMethod ?? "COD",
                    Note = request.Note,
                    VoucherId = voucherId,
                    DiscountAmount = discountAmount,
                    TotalAmount = Math.Max(0, orderTotal + shippingFee - discountAmount),
                    OrderDetails = orderDetails
                };

                await _unitOfWork.Order.AddAsync(order);

                // Nếu khách thanh toán từ giỏ hàng -> Xóa sạch các món trong giỏ
                if (!request.IsBuyNow && cartToClear != null)
                {
                    _unitOfWork.CartItem.RemoveRange(cartToClear.CartItems);
                }

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
        public async Task<PagedResult<OrderResponseDto>> GetMyOrdersAsync(int userId, int pageNumber, int pageSize, string? status = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            System.Linq.Expressions.Expression<Func<Order, bool>> filter = x =>
                x.UserId == userId &&
                (string.IsNullOrEmpty(status) || x.CurrentStatus == status);

            var orders = await _unitOfWork.Order.GetAllAsync(
                filter: filter,
                includeProperties: "OrderDetails.Product,OrderDetails.Size,OrderDetails.OrderDetailToppings.Topping,OrderDetails.Feedbacks,Customer,Address",
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

        // ================= HỦY ĐƠN HÀNG =================
        public async Task CancelOrderAsync(int userId, int orderId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var order = await _unitOfWork.Order.GetFirstOrDefaultAsync(
                    o => o.OrderId == orderId && o.UserId == userId,
                    includeProperties: "OrderDetails.OrderDetailToppings"
                );

                if (order == null)
                    throw new ArgumentException("Không tìm thấy đơn hàng!");

                if (order.CurrentStatus == OrderStatus.Cancelled)
                    throw new ArgumentException("Đơn hàng này đã được hủy trước đó.");

                if (order.CurrentStatus != OrderStatus.Pending)
                    throw new ArgumentException("Quán đã bắt đầu pha chế món của bạn, không thể hủy đơn!");

                await RestoreStockAsync(order.OrderDetails);
                await RestoreVoucherUsageAsync(userId, order.VoucherId);

                order.CurrentStatus = OrderStatus.Cancelled;
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


        // ================= CÁC HÀM HELPER XỬ LÝ LOGIC BÊN TRONG ==================
        // =========================================================================

        private async Task<int> ResolveAddressIdAsync(int userId, int? addressId, string? newAddressString, string? recipientName, string? phone, double? latitude, double? longitude)
        {
            // 1. Trường hợp dùng địa chỉ đã lưu (AddressId)
            if (addressId.HasValue && addressId.Value > 0)
            {
                var address = await _unitOfWork.Address.GetFirstOrDefaultAsync(a => a.AddressId == addressId.Value && a.UserId == userId);
                if (address == null) throw new ArgumentException("Địa chỉ giao hàng không hợp lệ!");
                return address.AddressId;
            }

            // 2. Trường hợp tạo địa chỉ mới
            if (!string.IsNullOrEmpty(newAddressString))
            {
                if (latitude == null || longitude == null)
                    throw new ArgumentException("Hệ thống không nhận diện được tọa độ (Vĩ độ/Kinh độ) của địa chỉ mới này trên bản đồ!");

                var newAddress = new Address
                {
                    UserId = userId,
                    FullAddress = newAddressString,
                    RecipientName = recipientName ?? "Khách hàng",
                    Phone = phone ?? "",
                    Latitude = latitude.Value,
                    Longitude = longitude.Value,
                    IsDefault = false
                };
                await _unitOfWork.Address.AddAsync(newAddress);
                await _unitOfWork.SaveAsync();
                return newAddress.AddressId;
            }

            throw new ArgumentException("Vui lòng chọn hoặc nhập địa chỉ giao hàng!");
        }

        // --- CÁC HÀM BẢO MẬT & XỬ LÝ MAPBOX ---
        private double CalculateStraightDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var d1 = lat1 * (Math.PI / 180.0);
            var num1 = lon1 * (Math.PI / 180.0);
            var d2 = lat2 * (Math.PI / 180.0);
            var num2 = lon2 * (Math.PI / 180.0) - num1;
            var d3 = Math.Pow(Math.Sin((d2 - d1) / 2.0), 2.0) +
                     Math.Cos(d1) * Math.Cos(d2) * Math.Pow(Math.Sin(num2 / 2.0), 2.0);
            return 6371 * (2.0 * Math.Atan2(Math.Sqrt(d3), Math.Sqrt(1.0 - d3)));
        }

        private async Task ValidateDistanceIntegrityAsync(double reportedDistanceKm, int? addressId, double? newLat, double? newLng, int userId)
        {
            double targetLat = 0, targetLng = 0;

            if (newLat.HasValue && newLng.HasValue)
            {
                targetLat = newLat.Value;
                targetLng = newLng.Value;
            }
            else if (addressId.HasValue)
            {
                var address = await _unitOfWork.Address.GetFirstOrDefaultAsync(a => a.AddressId == addressId.Value && a.UserId == userId);
                if (address != null)
                {
                    targetLat = address.Latitude;
                    targetLng = address.Longitude;
                }
                else return;
            }
            else return;

            double straightDistance = CalculateStraightDistance(CAFE_LAT, CAFE_LNG, targetLat, targetLng);

            // Trừ hao 200m sai số bản đồ
            if (reportedDistanceKm < (straightDistance - 0.2))
            {
                throw new ArgumentException($"Dữ liệu khoảng cách bị sai lệch! (Thực tế không thể nhỏ hơn {Math.Round(straightDistance, 1)}km). Vui lòng thử lại!");
            }
        }

        // --- HOÀN KHO KHI HỦY ĐƠN (ĐỐI XỨNG VỚI LOGIC TRỪ KHO LÚC ĐẶT) ---
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

        // --- CÁC HÀM BUILD ĐƠN HÀNG VÀ TRỪ KHO ---
        private async Task<(List<OrderDetail> details, decimal total, Cart cart)> BuildOrderDetailsFromCartAsync(int userId)
        {
            var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(
                c => c.UserId == userId && c.Status == "active",
                includeProperties: "CartItems.Product,CartItems.Size,CartItems.CartItemToppings.Topping"
            );

            if (cart == null || !cart.CartItems.Any())
                throw new ArgumentException("Giỏ hàng trống!");

            decimal total = 0;
            var details = new List<OrderDetail>();

            foreach (var cartItem in cart.CartItems)
            {
                // 1. Trừ kho Sản phẩm / Size
                if (cartItem.SizeId.HasValue && cartItem.SizeId.Value > 0)
                {
                    var productSize = await _unitOfWork.ProductSize.GetFirstOrDefaultAsync(
                        ps => ps.ProductId == cartItem.ProductId && ps.SizeId == cartItem.SizeId.Value,
                        includeProperties: "Size"
                    );

                    if (productSize == null) throw new ArgumentException($"Sản phẩm '{cartItem.Product.Name}' không hỗ trợ kích cỡ này!");
                    if (productSize.StockQuantity < cartItem.Quantity) throw new ArgumentException($"Sản phẩm '{cartItem.Product.Name}' (Size {productSize.Size.Name}) chỉ còn {productSize.StockQuantity} ly!");

                    productSize.StockQuantity -= cartItem.Quantity;
                    _unitOfWork.ProductSize.Update(productSize);
                }
                else
                {
                    if (cartItem.Product.StockQuantity < cartItem.Quantity) throw new ArgumentException($"Sản phẩm '{cartItem.Product.Name}' chỉ còn {cartItem.Product.StockQuantity} phần!");

                    cartItem.Product.StockQuantity -= cartItem.Quantity;
                    _unitOfWork.Product.Update(cartItem.Product);
                }

                // 2. Trừ kho Topping
                foreach (var cartTopping in cartItem.CartItemToppings)
                {
                    int totalToppingNeeded = cartTopping.Quantity * cartItem.Quantity;
                    if (cartTopping.Topping.StockQuantity < totalToppingNeeded) throw new ArgumentException($"Topping '{cartTopping.Topping.Name}' không đủ số lượng!");

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
                total += (orderDetail.UnitPrice * orderDetail.Quantity);
                details.Add(orderDetail);
            }

            return (details, total, cart);
        }

        private async Task<(List<OrderDetail> details, decimal total)> BuildOrderDetailsFromItemsAsync(List<CreateOrderDetailDto> items)
        {
            decimal total = 0;
            var details = new List<OrderDetail>();

            foreach (var item in items)
            {
                int qty = item.Quantity > 0 ? item.Quantity : 1;
                decimal unitPrice = 0;

                var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == item.ProductId);
                if (product == null || !product.IsAvailable)
                    throw new ArgumentException($"Sản phẩm có ID {item.ProductId} không tồn tại hoặc đã ngừng bán!");

                unitPrice = product.BasePrice;

                // 1. Trừ kho Sản phẩm / Size
                if (item.SizeId.HasValue && item.SizeId.Value > 0)
                {
                    var productSize = await _unitOfWork.ProductSize.GetFirstOrDefaultAsync(
                        ps => ps.ProductId == item.ProductId && ps.SizeId == item.SizeId.Value,
                        includeProperties: "Size"
                    );

                    if (productSize == null) throw new ArgumentException($"Sản phẩm '{product.Name}' không hỗ trợ kích cỡ này!");
                    if (productSize.StockQuantity < qty) throw new ArgumentException($"Sản phẩm '{product.Name}' (Size {productSize.Size.Name}) chỉ còn {productSize.StockQuantity} ly!");

                    if (productSize.Price.HasValue) unitPrice = productSize.Price.Value;

                    productSize.StockQuantity -= qty;
                    _unitOfWork.ProductSize.Update(productSize);
                }
                else
                {
                    if (product.StockQuantity < qty) throw new ArgumentException($"Sản phẩm '{product.Name}' chỉ còn {product.StockQuantity} phần!");

                    product.StockQuantity -= qty;
                    _unitOfWork.Product.Update(product);
                }

                // 2. Trừ kho Topping
                var orderDetailToppings = new List<OrderDetailTopping>();
                if (item.Toppings != null && item.Toppings.Any())
                {
                    foreach (var top in item.Toppings)
                    {
                        var toppingInfo = await _unitOfWork.Topping.GetFirstOrDefaultAsync(t => t.ToppingId == top.ToppingId);
                        if (toppingInfo != null && toppingInfo.IsAvailable)
                        {
                            int totalToppingNeeded = top.Quantity * qty;
                            if (toppingInfo.StockQuantity < totalToppingNeeded) throw new ArgumentException($"Topping '{toppingInfo.Name}' chỉ còn {toppingInfo.StockQuantity} phần!");

                            decimal toppingPrice = (decimal)(toppingInfo.Price ?? 0) * top.Quantity;
                            unitPrice += toppingPrice;

                            toppingInfo.StockQuantity -= totalToppingNeeded;
                            _unitOfWork.Topping.Update(toppingInfo);

                            orderDetailToppings.Add(new OrderDetailTopping
                            {
                                ToppingId = toppingInfo.ToppingId,
                                Quantity = top.Quantity,
                                UnitPrice = toppingPrice
                            });
                        }
                    }
                }

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