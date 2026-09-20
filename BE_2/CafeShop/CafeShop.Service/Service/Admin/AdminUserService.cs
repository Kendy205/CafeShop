using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Admin;
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
    public class AdminUserService : IAdminUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AdminUserService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResult<AdminUserDto>> GetAllUsersAsync(string? searchKeyword, int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            System.Linq.Expressions.Expression<Func<User, bool>> filter = x =>
                string.IsNullOrEmpty(searchKeyword) ||
                x.Username.Contains(searchKeyword) ||
                (x.FullName != null && x.FullName.Contains(searchKeyword)) ||
                (x.PhoneNumber != null && x.PhoneNumber.Contains(searchKeyword));

            var users = await _unitOfWork.User.GetAllAsync(
                filter: filter,
                pageSize: pageSize,
                pageNumber: pageNumber,
                orderBy: q => q.OrderByDescending(u => u.CreatedAt)
            );

            var totalCount = await _unitOfWork.User.CountAsync(filter);
            
            var items = _mapper.Map<List<AdminUserDto>>(users);
            
            return new PagedResult<AdminUserDto>
            {
                Items = items,
                Total = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<AdminUserDto?> GetUserByIdAsync(int id)
        {
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return null;

            return _mapper.Map<AdminUserDto>(user);
        }

        public async Task<bool> ToggleUserStatusAsync(int id)
        {
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == id);
            if (user == null)
                throw new ArgumentException("Người dùng không tồn tại!");

            // Prevent Admin from blocking other Admins for safety
            if (user.Role == SystemRole.Admin)
                throw new ArgumentException("Không thể khóa tài khoản quản trị viên!");

            user.IsActive = !user.IsActive;
            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();

            return user.IsActive;
        }
    }
}
