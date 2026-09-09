using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Voucher;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.IService.Users;
using CafeShop.Uitls;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.Services
{
    public class VoucherService : IVoucherService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserVoucherService _userVoucherService;
        private readonly IMapper _mapper;

        public VoucherService(IUnitOfWork unitOfWork, IMapper mapper, IUserVoucherService userVoucherService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userVoucherService = userVoucherService;

        }

        // =========================================================================
        // CLIENT LOGIC
        // =========================================================================

        //public async Task<List<VoucherDto>> GetAvailableVouchersAsync(int userId)
        //{
        //    DateTime now = DateTime.UtcNow;

        //    // 1. Voucher Public còn hạn và còn lượt dùng hệ thống
        //    var publicVouchers = await _unitOfWork.Voucher.GetAllAsync(v =>
        //        v.IsActive &&
        //        v.TargetType == VoucherTypeTarget.PUBLIC &&
        //        v.StartDate <= now &&
        //        v.EndDate >= now &&
        //        v.UsedCount < v.UsageLimit
        //    );

        //    // 2. Voucher Personal được tặng riêng cho user và chưa dùng hết lượt cá nhân
        //    var userVouchers = await _unitOfWork.UserVoucher.GetAllAsync(
        //        uv => uv.UserId == userId &&
        //              uv.UsedCount < uv.UsageLimitPerUser &&
        //              uv.Voucher.IsActive &&
        //              uv.Voucher.StartDate <= now &&
        //              uv.Voucher.EndDate >= now,
        //        includeProperties: "Voucher"
        //    );

        //    var personalVouchers = userVouchers.Select(uv => uv.Voucher);

        //    var allAvailable = publicVouchers.Concat(personalVouchers)
        //                                     .DistinctBy(v => v.VoucherId)
        //                                     .ToList();

        //    return _mapper.Map<List<VoucherDto>>(allAvailable);
        //}
        public async Task<List<VoucherDto>> GetAvailableVouchersAsync(int userId)
        {
            DateTime now = DateTime.UtcNow;

            // 1. Mã Public (các trường cá nhân tự mang giá trị null)
            var publicVouchers = (await _unitOfWork.Voucher.GetAllAsync(v =>
                v.IsActive &&
                v.TargetType == VoucherTypeTarget.PUBLIC &&
                v.StartDate <= now &&
                v.EndDate >= now &&
                v.UsedCount < v.UsageLimit
            )).Select(v => new VoucherDto
            {
                VoucherId = v.VoucherId,
                Code = v.Code,
                Description = v.Description ?? string.Empty,
                TargetType = v.TargetType.ToString(),
                ApplyType = v.ApplyType.ToString(),
                DiscountType = v.DiscountType.ToString(),
                DiscountValue = v.DiscountValue,
                MinOrderValue = v.MinOrderValue,
                MaxDiscountAmount = v.MaxDiscountAmount,
                StartDate = v.StartDate,
                EndDate = v.EndDate,
                UsageLimit = v.UsageLimit,
                UsedCount = v.UsedCount,
                IsActive = v.IsActive,
                IsUsable = true
            });

            // 2. Mã trong ví cá nhân
            var myVouchers = await _userVoucherService.GetMyVouchersAsync(userId);

            // 3. Lọc các voucher trong ví (nếu chưa chắc chắn về IsUsable, có thể kiểm tra trực tiếp)
            var validMyVouchers = myVouchers
                .Where(v => v.IsUsable)
                .ToList();

            // 4. GỘP CÓ ƯU TIÊN: Đưa ví cá nhân lên TRƯỚC publicVouchers
            // Nhờ đó, nếu một voucher vừa là Public vừa có trong ví user, 
            // DistinctBy sẽ ưu tiên giữ lại bản ghi có đầy đủ thông tin cá nhân (UserVoucherId, RemainingUsage,...)
            var allAvailable = validMyVouchers
                .Concat(publicVouchers)
                .DistinctBy(v => v.VoucherId)
                .OrderByDescending(v => v.TargetType == VoucherTypeTarget.USER.ToString()) // Đẩy mã cá nhân lên đầu danh sách cho user dễ thấy
                .ThenByDescending(v => v.DiscountValue)
                .ToList();

            return allAvailable;
        }

        public async Task<VoucherResponseDto> CheckVoucherAsync(int userId, CheckVoucherRequestDto request)
        {
            decimal orderTotal = 0;

            // 1. Tính toán giá trị đơn hàng (Zero-Trust)
            if (request.IsBuyNow)
            {
                if (request.Items == null || !request.Items.Any())
                    throw new ArgumentException("Danh sách sản phẩm mua ngay không được để trống!");

                foreach (var item in request.Items)
                {
                    var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == item.ProductId);
                    if (product == null || !product.IsAvailable)
                        throw new ArgumentException($"Sản phẩm với ID {item.ProductId} không tồn tại hoặc đã ngừng bán!");

                    decimal unitPrice = product.BasePrice;

                    if (item.SizeId.HasValue)
                    {
                        var sizeInfo = await _unitOfWork.Size.GetFirstOrDefaultAsync(s => s.SizeId == item.SizeId.Value);
                        if (sizeInfo != null && sizeInfo.PercentIncrease > 0)
                        {
                            unitPrice += product.BasePrice * (sizeInfo.PercentIncrease / 100m);
                        }
                    }

                    if (item.Toppings != null && item.Toppings.Any())
                    {
                        foreach (var top in item.Toppings)
                        {
                            var toppingInfo = await _unitOfWork.Topping.GetFirstOrDefaultAsync(t => t.ToppingId == top.ToppingId);
                            if (toppingInfo != null && toppingInfo.IsAvailable)
                            {
                                unitPrice += (decimal)(toppingInfo.Price ?? 0) * top.Quantity;
                            }
                        }
                    }

                    orderTotal += unitPrice * (item.Quantity > 0 ? item.Quantity : 1);
                }
            }
            else
            {
                var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(c => c.UserId == userId && c.Status == "active", "CartItems");
                if (cart == null || !cart.CartItems.Any())
                    throw new ArgumentException("Giỏ hàng đang trống, không thể áp dụng mã giảm giá!");

                orderTotal = cart.CartItems.Sum(x => x.UnitPrice * x.Quantity);
            }

            // 2. Tính phí ship giả lập theo khoảng cách
            decimal shippingFee = CalculateShippingFee(request.DistanceKm);

            // 3. Tìm voucher
            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.Code == request.VoucherCode);
            if (voucher == null)
                throw new ArgumentException("Mã giảm giá không tồn tại!");

            UserVoucher? userVoucher = null;
            if (voucher.TargetType == VoucherTypeTarget.USER)
            {
                userVoucher = await _unitOfWork.UserVoucher.GetFirstOrDefaultAsync(uv => uv.UserId == userId && uv.VoucherId == voucher.VoucherId);
            }

            // 4. Validate & Tính tiền giảm
            decimal discount = ValidateAndCalculateDiscount(voucher, userId, orderTotal, shippingFee, userVoucher);

            // 5. Phân bổ kết quả theo ApplyType (Order hay Shipping)
            decimal finalShippingFee = shippingFee;
            decimal finalOrderAmount = orderTotal;

            if (voucher.ApplyType == VoucherApplyType.SHIPPING)
            {
                finalShippingFee = Math.Max(0, shippingFee - discount);
            }
            else
            {
                finalOrderAmount = Math.Max(0, orderTotal - discount);
            }

            return new VoucherResponseDto
            {
                VoucherId = voucher.VoucherId,
                Code = voucher.Code,
                ApplyType = voucher.ApplyType,
                DiscountAmount = discount,
                FinalOrderAmount = finalOrderAmount,
                FinalShippingFee = finalShippingFee,
                FinalTotal = finalOrderAmount + finalShippingFee
            };
        }

        // =========================================================================
        // ADMIN LOGIC
        // =========================================================================

        public async Task<object> GetAllVouchersAsync(int pageNumber, int pageSize)
        {
            var vouchers = await _unitOfWork.Voucher.GetAllAsync();
            var totalItems = vouchers.Count();
            var pagedData = vouchers.OrderByDescending(v => v.VoucherId)
                                    .Skip((pageNumber - 1) * pageSize)
                                    .Take(pageSize)
                                    .ToList();

            return new
            {
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                Items = _mapper.Map<List<VoucherDto>>(pagedData)
            };
        }

        public async Task<VoucherDto?> GetVoucherByIdAsync(int id)
        {
            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.VoucherId == id);
            return voucher == null ? null : _mapper.Map<VoucherDto>(voucher);
        }

        public async Task<VoucherDto> CreateVoucherAsync(CreateVoucherDto dto)
        {
            var existing = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.Code == dto.Code);
            if (existing != null)
                throw new ArgumentException($"Mã voucher '{dto.Code}' đã tồn tại trong hệ thống!");

            if (dto.EndDate <= dto.StartDate)
                throw new ArgumentException("Ngày kết thúc phải lớn hơn ngày bắt đầu!");

            var voucher = _mapper.Map<Voucher>(dto);
            voucher.UsedCount = 0;

            await _unitOfWork.Voucher.AddAsync(voucher);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<VoucherDto>(voucher);
        }

        public async Task<VoucherDto> UpdateVoucherAsync(int id, UpdateVoucherDto dto)
        {
            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.VoucherId == id);
            if (voucher == null)
                throw new ArgumentException("Mã giảm giá không tồn tại!");

            if (dto.EndDate <= dto.StartDate)
                throw new ArgumentException("Ngày kết thúc phải lớn hơn ngày bắt đầu!");

            _mapper.Map(dto, voucher);
            _unitOfWork.Voucher.Update(voucher);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<VoucherDto>(voucher);
        }

        public async Task<bool> ToggleActiveAsync(int id)
        {
            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.VoucherId == id);
            if (voucher == null)
                throw new ArgumentException("Mã giảm giá không tồn tại!");

            voucher.IsActive = !voucher.IsActive;
            _unitOfWork.Voucher.Update(voucher);
            await _unitOfWork.SaveAsync();

            return voucher.IsActive;
        }

        public async Task DeleteVoucherAsync(int id)
        {
            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.VoucherId == id);
            if (voucher == null)
                throw new ArgumentException("Mã giảm giá không tồn tại!");

            _unitOfWork.Voucher.Remove(voucher);
            await _unitOfWork.SaveAsync();
        }

        public async Task AssignVoucherToUserAsync(AssignUserVoucherDto dto)
        {
            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.VoucherId == dto.VoucherId);
            if (voucher == null)
                throw new ArgumentException("Mã giảm giá không tồn tại!");

            if (voucher.TargetType != "Personal")
                throw new ArgumentException("Chỉ có thể gán mã cá nhân (Personal) cho người dùng!");

            foreach (var uId in dto.UserIds)
            {
                var existingAssignment = await _unitOfWork.UserVoucher.GetFirstOrDefaultAsync(
                    uv => uv.UserId == uId && uv.VoucherId == dto.VoucherId
                );

                if (existingAssignment == null)
                {
                    await _unitOfWork.UserVoucher.AddAsync(new UserVoucher
                    {
                        UserId = uId,
                        VoucherId = dto.VoucherId,
                        UsageLimitPerUser = dto.UsageLimitPerUser > 0 ? dto.UsageLimitPerUser : 1,
                        UsedCount = 0,
                        AssignedDate = DateTime.UtcNow
                    });
                }
            }

            await _unitOfWork.SaveAsync();
        }

        // =========================================================================
        // PRIVATE HELPER METHODS
        // =========================================================================

        private decimal ValidateAndCalculateDiscount(Voucher voucher, int userId, decimal orderTotal, decimal shippingFee, UserVoucher? userVoucher)
        {
            // 1. Kiểm tra trạng thái kích hoạt
            if (!voucher.IsActive)
                throw new ArgumentException("Mã giảm giá hiện đang bị tạm khóa!");

            // 2. Kiểm tra thời hạn hiệu lực
            DateTime now = DateTime.UtcNow;
            if (now < voucher.StartDate || now > voucher.EndDate)
                throw new ArgumentException("Mã giảm giá chưa đến đợt áp dụng hoặc đã hết hạn!");

            // 3. Kiểm tra số lượt dùng toàn hệ thống
            if (voucher.UsedCount >= voucher.UsageLimit)
                throw new ArgumentException("Mã giảm giá đã hết lượt sử dụng toàn hệ thống!");

            // 4. Kiểm tra đơn hàng tối thiểu
            if (orderTotal < voucher.MinOrderValue)
                throw new ArgumentException($"Đơn hàng tối thiểu phải từ {voucher.MinOrderValue:N0} đ để dùng mã này!");

            // 5. Kiểm tra voucher cá nhân (USER / PERSONAL)
            if (voucher.TargetType == VoucherTypeTarget.USER)
            {
                if (userVoucher == null || userVoucher.UserId != userId)
                    throw new ArgumentException("Bạn không sở hữu mã giảm giá này!");

                if (userVoucher.UsedCount >= userVoucher.UsageLimitPerUser)
                    throw new ArgumentException("Bạn đã dùng hết số lượt của mã giảm giá cá nhân này!");
            }

            decimal discount = 0;

            // =========================================================
            // TRƯỜNG HỢP A: GIẢM TRỪ VÀO PHÍ VẬN CHUYỂN (SHIPPING)
            // =========================================================
            if (voucher.ApplyType == VoucherApplyType.SHIPPING)
            {
                if (shippingFee <= 0) return 0;

                if (voucher.DiscountType == DiscountApplyType.FIXED)
                {
                    discount = voucher.DiscountValue;
                }
                else if (voucher.DiscountType == DiscountApplyType.PERCENTAGE)
                {
                    discount = shippingFee * (voucher.DiscountValue / 100m);
                   
                    if (voucher.MaxDiscountAmount > 0 && discount > voucher.MaxDiscountAmount)
                        discount = voucher.MaxDiscountAmount;
                }

                // Không bao giờ giảm vượt quá phí ship thực tế
                return Math.Min(discount, shippingFee);
            }

            // =========================================================
            // TRƯỜNG HỢP B: GIẢM TRỪ VÀO TIỀN HÀNG (ORDER)
            // =========================================================
            
            if (voucher.DiscountType == DiscountApplyType.FIXED)
            {
                discount = voucher.DiscountValue;
            }
            else if (voucher.DiscountType == DiscountApplyType.PERCENTAGE)
            {
                discount = orderTotal * (voucher.DiscountValue / 100m);
                
                if (voucher.MaxDiscountAmount > 0 && discount > voucher.MaxDiscountAmount)
                    discount = voucher.MaxDiscountAmount;
            }

            // Không bao giờ giảm vượt quá tổng tiền hàng
            return Math.Min(discount, orderTotal);
        }

        private decimal CalculateShippingFee(double distanceKm)
        {
            if (distanceKm <= 0) return 0;
            if (distanceKm <= 3) return 15000;

            decimal extraKm = (decimal)Math.Ceiling(distanceKm - 3);
            return 15000 + (extraKm * 5000);
        }

        public async Task<(int VoucherId, decimal DiscountAmount)> ConsumeVoucherAsync(
         string voucherCode,
         int userId,
         decimal orderTotal,
         decimal shippingFee)
        {
            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.Code == voucherCode);
            if (voucher == null)
                throw new ArgumentException("Mã giảm giá không tồn tại!");

            UserVoucher? userVoucher = null;
            if (voucher.TargetType == "Personal")
            {
                userVoucher = await _unitOfWork.UserVoucher.GetFirstOrDefaultAsync(
                    uv => uv.UserId == userId && uv.VoucherId == voucher.VoucherId
                );
            }

            // Validate lại các điều kiện
            decimal discount = ValidateAndCalculateDiscount(voucher, userId, orderTotal, shippingFee, userVoucher);

            // Tiêu thụ lượt dùng toàn hệ thống
            voucher.UsedCount += 1;
            _unitOfWork.Voucher.Update(voucher);

            // Nếu là mã cá nhân -> Tiêu thụ lượt dùng của user
            if (voucher.TargetType == VoucherTypeTarget.USER && userVoucher != null)
            {
                userVoucher.UsedCount += 1;
                _unitOfWork.UserVoucher.Update(userVoucher);
            }

            return (voucher.VoucherId, discount);
        }
    }

}
