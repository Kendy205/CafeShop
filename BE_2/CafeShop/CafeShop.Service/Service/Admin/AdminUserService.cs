using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;
using CafeShop.DTO.Product.Requests;
using CafeShop.DTO.Product.Responses;
using CafeShop.DTO.User;
using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard.Requests;
using CafeShop.DTO.Dashboard.Responses;
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

        public async Task<PagedResult<AdminUserDto>> GetAllUsersAsync(string? keyword, int pageNumber, int pageSize)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            System.Linq.Expressions.Expression<Func<User, bool>> filter = x =>
                string.IsNullOrEmpty(keyword) ||
                x.Username.Contains(keyword) ||
                (x.FullName != null && x.FullName.Contains(keyword)) ||
                (x.PhoneNumber != null && x.PhoneNumber.Contains(keyword));

            var users = await _unitOfWork.User.GetAllAsync(
                filter: filter,
                includeProperties: "UserRoles.Role",
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
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == id, includeProperties: "UserRoles.Role");
            if (user == null) return null;

            return _mapper.Map<AdminUserDto>(user);
        }

        public async Task<AdminUserDto> CreateUserAsync(CreateAdminUserDto dto)
        {
            var existingUser = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.Username == dto.Username);
            if (existingUser != null)
                throw new ArgumentException("Tên đăng nhập đã tồn tại!");

            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var newCart = new Cart
            {
                User = newUser,
                Status = CafeShop.Uitls.CartStatus.Active
            };

            await _unitOfWork.User.AddAsync(newUser);
            await _unitOfWork.Cart.AddAsync(newCart);
            await _unitOfWork.SaveAsync();

            if (dto.RoleIds != null && dto.RoleIds.Any())
            {
                await AssignRolesAsync(newUser.UserId, dto.RoleIds);
            }

            var createdUser = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == newUser.UserId, includeProperties: "UserRoles.Role");
            return _mapper.Map<AdminUserDto>(createdUser);
        }

        public async Task<AdminUserDto> UpdateUserAsync(int id, UpdateAdminUserDto dto)
        {
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == id, includeProperties: "UserRoles.Role");
            if (user == null)
                throw new ArgumentException("Người dùng không tồn tại!");

            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.Email = dto.Email;

            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<AdminUserDto>(user);
        }

        public async Task<bool> ToggleUserStatusAsync(int id)
        {
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == id, includeProperties: "UserRoles.Role");
            if (user == null)
                throw new ArgumentException("Người dùng không tồn tại!");

            // Prevent Admin from blocking other Admins for safety
            if (user.UserRoles != null && user.UserRoles.Any(ur => ur.Role != null && ur.Role.Name == SystemRole.Admin))
                throw new ArgumentException("Không thể khóa tài khoản quản trị viên!");

            user.IsActive = !user.IsActive;
            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();

            return user.IsActive;
        }

        public async Task AssignRolesAsync(int userId, List<int> roleIds)
        {
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == userId, includeProperties: "UserRoles.Role");
            if (user == null)
                throw new ArgumentException("Người dùng không tồn tại!");

            var validRoles = await _unitOfWork.Role.GetAllAsync(r => roleIds.Contains(r.RoleId));
            if (validRoles.Count() != roleIds.Count)
                throw new ArgumentException("Danh sách quyền có chứa ID không hợp lệ!");

            var isAdminCurrently = user.UserRoles != null && user.UserRoles.Any(ur => ur.Role != null && ur.Role.Name == SystemRole.Admin);
            var willBeAdmin = validRoles.Any(r => r.Name == SystemRole.Admin);

            if (isAdminCurrently && !willBeAdmin)
            {
                var allAdmins = await _unitOfWork.UserRole.GetAllAsync(ur => ur.Role.Name == SystemRole.Admin);
                var distinctAdminUsers = allAdmins.Select(ur => ur.UserId).Distinct().ToList();
                if (distinctAdminUsers.Count <= 1 && distinctAdminUsers.Contains(userId))
                {
                    throw new ArgumentException("Không thể gỡ quyền Admin của quản trị viên duy nhất trong hệ thống!");
                }
            }

            if (user.UserRoles != null && user.UserRoles.Any())
            {
                _unitOfWork.UserRole.RemoveRange(user.UserRoles);
            }

            var newUserRoles = roleIds.Select(roleId => new UserRole { UserId = userId, RoleId = roleId }).ToList();
            foreach (var ur in newUserRoles)
            {
                await _unitOfWork.UserRole.AddAsync(ur);
            }
            
            await _unitOfWork.SaveAsync();
        }
    }
}
