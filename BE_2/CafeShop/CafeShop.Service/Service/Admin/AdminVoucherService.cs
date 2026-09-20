using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Voucher;
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
            var vouchers = await _unitOfWork.Voucher.GetAllAsync();
            var totalItems = vouchers.Count();
            var pagedData = vouchers.OrderByDescending(v => v.VoucherId)
                                    .Skip((pageNumber - 1) * pageSize)
                                    .Take(pageSize)
                                    .ToList();

            return new PagedResult<VoucherDto>
            {
                Total = totalItems,
                Page = pageNumber,
                PageSize = pageSize,
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

            if (!VoucherTypeTarget.IsUser(voucher.TargetType))
                throw new ArgumentException("Chỉ có thể gán mã cá nhân (USER) cho người dùng!");

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
    }
}
