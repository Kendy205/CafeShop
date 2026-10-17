using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Voucher.Requests;
using CafeShop.DTO.Voucher.Responses;
using CafeShop.Model;
using CafeShop.Service.IService.Admin;
using CafeShop.Service.Helpers;
using CafeShop.Uitls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Admin
{
    public class AdminVoucherService : IAdminVoucherService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AdminVoucherService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResult<VoucherDto>> GetAllVouchersAsync(int pageNumber, int pageSize)
        {
            var vouchers = await _unitOfWork.Voucher.GetAllAsync(
                pageSize: pageSize,
                pageNumber: pageNumber,
                orderBy: q => q.OrderByDescending(v => v.VoucherId),
                includeProperties: "UserVouchers"
            );
            
            var totalItems = await _unitOfWork.Voucher.CountAsync();

            var items = vouchers.Select(v => MapToVoucherDto(v)).ToList();

            return new PagedResult<VoucherDto>
            {
                Total = totalItems,
                Page = pageNumber,
                PageSize = pageSize,
                Items = items
            };
        }

        public async Task<VoucherDto?> GetVoucherByIdAsync(int id)
        {
            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(
                v => v.VoucherId == id,
                includeProperties: "UserVouchers"
            );
            return voucher == null ? null : MapToVoucherDto(voucher);
        }

        public async Task<VoucherDto> CreateVoucherAsync(CreateVoucherDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.Code))
            {
                var existing = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.Code == dto.Code);
                if (existing != null)
                    throw new ArgumentException($"Mã voucher '{dto.Code}' đã tồn tại trong hệ thống!");
            }

            if (dto.EndDate <= dto.StartDate)
                throw new ArgumentException("Ngày kết thúc phải lớn hơn ngày bắt đầu!");

            var isUserType = VoucherTypeTarget.IsUser(dto.TargetType);
            var limitPerUser = (dto.UsageLimitPerUser.HasValue && dto.UsageLimitPerUser.Value > 0)
                ? dto.UsageLimitPerUser.Value
                : 1;

            var voucher = _mapper.Map<Voucher>(dto);
            voucher.TargetType = isUserType ? VoucherTypeTarget.USER : VoucherTypeTarget.PUBLIC;
            voucher.UsedCount = 0;

            if (isUserType)
            {
                var distinctUserIds = dto.UserIds?.Distinct().ToList() ?? new List<int>();
                if (dto.UsageLimit <= 0)
                {
                    voucher.UsageLimit = Math.Max(1, distinctUserIds.Count) * limitPerUser;
                }
                else
                {
                    voucher.UsageLimit = dto.UsageLimit;
                }

                await _unitOfWork.Voucher.AddAsync(voucher);
                await _unitOfWork.SaveAsync();

                if (distinctUserIds.Any())
                {
                    var validUserIds = (await _unitOfWork.User.GetAllAsync(u => distinctUserIds.Contains(u.UserId)))
                        .Select(u => u.UserId)
                        .ToHashSet();

                    foreach (var uId in distinctUserIds)
                    {
                        if (!validUserIds.Contains(uId)) continue;

                        await _unitOfWork.UserVoucher.AddAsync(new UserVoucher
                        {
                            UserId = uId,
                            VoucherId = voucher.VoucherId,
                            UsageLimitPerUser = limitPerUser,
                            UsedCount = 0,
                            AssignedDate = DateTimeHelper.VietnamNow
                        });
                    }
                    await _unitOfWork.SaveAsync();
                }
            }
            else
            {
                voucher.UsageLimit = dto.UsageLimit > 0 ? dto.UsageLimit : 0;
                await _unitOfWork.Voucher.AddAsync(voucher);
                await _unitOfWork.SaveAsync();
            }

            var createdVoucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(
                v => v.VoucherId == voucher.VoucherId,
                includeProperties: "UserVouchers"
            );

            return MapToVoucherDto(createdVoucher ?? voucher);
        }

        public async Task<VoucherDto> UpdateVoucherAsync(int id, UpdateVoucherDto dto)
        {
            var voucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(
                v => v.VoucherId == id,
                includeProperties: "UserVouchers"
            );
            if (voucher == null)
                throw new ArgumentException("Mã giảm giá không tồn tại!");

            if (dto.EndDate <= dto.StartDate)
                throw new ArgumentException("Ngày kết thúc phải lớn hơn ngày bắt đầu!");

            if (!string.IsNullOrWhiteSpace(dto.Code) && dto.Code != voucher.Code)
            {
                var existing = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(v => v.Code == dto.Code && v.VoucherId != id);
                if (existing != null)
                    throw new ArgumentException($"Mã voucher '{dto.Code}' đã tồn tại trong hệ thống!");
            }

            var isUserType = VoucherTypeTarget.IsUser(dto.TargetType);
            var limitPerUser = (dto.UsageLimitPerUser.HasValue && dto.UsageLimitPerUser.Value > 0)
                ? dto.UsageLimitPerUser.Value
                : 1;

            _mapper.Map(dto, voucher);
            voucher.TargetType = isUserType ? VoucherTypeTarget.USER : VoucherTypeTarget.PUBLIC;

            if (isUserType)
            {
                var targetUserIds = dto.UserIds?.Distinct().ToList() ?? new List<int>();
                if (dto.UsageLimit <= 0)
                {
                    voucher.UsageLimit = Math.Max(1, targetUserIds.Count) * limitPerUser;
                }

                var currentUserVouchers = voucher.UserVouchers?.ToList() ?? new List<UserVoucher>();

                // 1. Thêm user mới và cập nhật limit cho user hiện có (Batch query - loại bỏ N+1)
                var usersToAdd = targetUserIds.Where(uId => !currentUserVouchers.Any(uv => uv.UserId == uId)).ToList();
                var validUsersToAdd = usersToAdd.Any()
                    ? (await _unitOfWork.User.GetAllAsync(u => usersToAdd.Contains(u.UserId))).Select(u => u.UserId).ToHashSet()
                    : new HashSet<int>();

                foreach (var uId in targetUserIds)
                {
                    var existingUV = currentUserVouchers.FirstOrDefault(uv => uv.UserId == uId);
                    if (existingUV == null)
                    {
                        if (!validUsersToAdd.Contains(uId)) continue;

                        await _unitOfWork.UserVoucher.AddAsync(new UserVoucher
                        {
                            UserId = uId,
                            VoucherId = voucher.VoucherId,
                            UsageLimitPerUser = limitPerUser,
                            UsedCount = 0,
                            AssignedDate = DateTimeHelper.VietnamNow
                        });
                    }
                    else
                    {
                        existingUV.UsageLimitPerUser = limitPerUser;
                        _unitOfWork.UserVoucher.Update(existingUV);
                    }
                }

                // 2. Gỡ bỏ user không còn trong danh sách (chỉ gỡ nếu chưa sử dụng mã)
                foreach (var existingUV in currentUserVouchers)
                {
                    if (!targetUserIds.Contains(existingUV.UserId) && existingUV.UsedCount == 0)
                    {
                        _unitOfWork.UserVoucher.Remove(existingUV);
                    }
                }
            }

            _unitOfWork.Voucher.Update(voucher);
            await _unitOfWork.SaveAsync();

            var updatedVoucher = await _unitOfWork.Voucher.GetFirstOrDefaultAsync(
                v => v.VoucherId == id,
                includeProperties: "UserVouchers"
            );

            return MapToVoucherDto(updatedVoucher ?? voucher);
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

            if (!VoucherTypeTarget.IsUser(voucher.TargetType))
                throw new ArgumentException("Chỉ có thể gán mã cá nhân (USER) cho người dùng!");

            var distinctUserIds = dto.UserIds?.Distinct().ToList() ?? new List<int>();
            if (!distinctUserIds.Any()) return;

            var existingUserIds = (await _unitOfWork.UserVoucher.GetAllAsync(
                uv => distinctUserIds.Contains(uv.UserId) && uv.VoucherId == dto.VoucherId
            )).Select(uv => uv.UserId).ToHashSet();

            var validUserIds = (await _unitOfWork.User.GetAllAsync(u => distinctUserIds.Contains(u.UserId)))
                .Select(u => u.UserId)
                .ToHashSet();

            int limitPerUser = dto.UsageLimitPerUser > 0 ? dto.UsageLimitPerUser : 1;
            foreach (var uId in distinctUserIds)
            {
                if (validUserIds.Contains(uId) && !existingUserIds.Contains(uId))
                {
                    await _unitOfWork.UserVoucher.AddAsync(new UserVoucher
                    {
                        UserId = uId,
                        VoucherId = dto.VoucherId,
                        UsageLimitPerUser = limitPerUser,
                        UsedCount = 0,
                        AssignedDate = DateTimeHelper.VietnamNow
                    });
                }
            }

            await _unitOfWork.SaveAsync();
        }

        private VoucherDto MapToVoucherDto(Voucher voucher)
        {
            var dto = _mapper.Map<VoucherDto>(voucher);
            if (VoucherTypeTarget.IsUser(voucher.TargetType))
            {
                var userVouchers = voucher.UserVouchers ?? new List<UserVoucher>();
                dto.UsageLimitPerUser = userVouchers.FirstOrDefault()?.UsageLimitPerUser ?? 1;
                dto.AssignedUsersCount = userVouchers.Count;
                dto.UserIds = userVouchers.Select(uv => uv.UserId).ToList();
            }
            else
            {
                dto.UsageLimitPerUser = null;
                dto.AssignedUsersCount = 0;
                dto.UserIds = null;
            }
            return dto;
        }
    }
}
