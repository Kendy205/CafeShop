using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Voucher;
using CafeShop.Model;
using CafeShop.Service.IService.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Users
{
    public class UserVoucherService : IUserVoucherService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserVoucherService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // 1. Lấy danh sách voucher trong ví cá nhân
        public async Task<List<VoucherDto>> GetMyVouchersAsync(int userId)
        {
            DateTime now = DateTime.UtcNow;
            var userVouchers = await _unitOfWork.UserVoucher.GetUserVouchersWithDetailsAsync(userId);

            return userVouchers.Select(uv => new VoucherDto
            {
                UserVoucherId = uv.Id,
                VoucherId = uv.VoucherId,
                Code = uv.Voucher.Code,
                Description = uv.Voucher.Description ?? string.Empty,
                TargetType = uv.Voucher.TargetType.ToString(),
                ApplyType = uv.Voucher.ApplyType.ToString(),
                DiscountType = uv.Voucher.DiscountType.ToString(),
                DiscountValue = uv.Voucher.DiscountValue,
                MinOrderValue = uv.Voucher.MinOrderValue,
                MaxDiscountAmount = uv.Voucher.MaxDiscountAmount,
                StartDate = uv.Voucher.StartDate,
                EndDate = uv.Voucher.EndDate,
                UsageLimit = uv.Voucher.UsageLimit,
                UsedCount = uv.Voucher.UsedCount,
                IsActive = uv.Voucher.IsActive,

                // Gán thông tin cá nhân
                UsageLimitPerUser = uv.UsageLimitPerUser,
                UsedCountPerUser = uv.UsedCount,
                AssignedDate = uv.AssignedDate,
                IsUsable = uv.UsedCount < uv.UsageLimitPerUser &&
                           uv.Voucher.IsActive &&
                           uv.Voucher.StartDate <= now &&
                           uv.Voucher.EndDate >= now
            }).ToList();
        }

        // 2. Khách chủ động lưu mã Public vào ví của mình
        public async Task ClaimPublicVoucherAsync(int userId, string voucherCode)
        {
            DateTime now = DateTime.UtcNow;

            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.Code == voucherCode);
            if (voucher == null || !voucher.IsActive)
                throw new ArgumentException("Mã giảm giá không tồn tại hoặc đã bị khóa!");

            if (voucher.StartDate > now || voucher.EndDate < now)
                throw new ArgumentException("Mã giảm giá chưa bắt đầu hoặc đã hết hạn!");

            if (voucher.UsedCount >= voucher.UsageLimit)
                throw new ArgumentException("Mã giảm giá đã hết lượt sử dụng toàn hệ thống!");

            if (voucher.TargetType == "Personal")
                throw new ArgumentException("Đây là mã giảm giá tặng riêng, không thể tự nhận!");

            // Kiểm tra xem đã lưu voucher này vào ví chưa
            var existingRecord = await _unitOfWork.UserVoucher.GetFirstOrDefaultAsync(
                uv => uv.UserId == userId && uv.VoucherId == voucher.VoucherId
            );

            if (existingRecord != null)
                throw new ArgumentException("Bạn đã lưu mã giảm giá này vào ví rồi!");

            await _unitOfWork.UserVoucher.AddAsync(new UserVoucher
            {
                UserId = userId,
                VoucherId = voucher.VoucherId,
                UsageLimitPerUser = 1,
                UsedCount = 0,
                AssignedDate = DateTime.UtcNow
            });

            await _unitOfWork.SaveAsync();
        }
    }
}
