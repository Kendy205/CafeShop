using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.User;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
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
        private readonly IPhotoService _photoService;

        public AdminUserService(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
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

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var existingEmail = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.Email == dto.Email);
                if (existingEmail != null)
                    throw new ArgumentException("Email này đã được sử dụng bởi một tài khoản khác!");
            }

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            {
                var existingPhone = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.PhoneNumber == dto.PhoneNumber);
                if (existingPhone != null)
                    throw new ArgumentException("Số điện thoại này đã được sử dụng bởi một tài khoản khác!");
            }

            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                IsActive = true,
                CreatedAt = DateTimeHelper.VietnamNow
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

            // 1. Kiểm tra trùng lặp Email với user khác
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var existingEmail = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.Email == dto.Email && u.UserId != id);
                if (existingEmail != null)
                    throw new ArgumentException("Email này đã được sử dụng bởi một tài khoản khác!");
            }

            // 2. Kiểm tra trùng lặp Số điện thoại với user khác
            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            {
                var existingPhone = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.PhoneNumber == dto.PhoneNumber && u.UserId != id);
                if (existingPhone != null)
                    throw new ArgumentException("Số điện thoại này đã được sử dụng bởi một tài khoản khác!");
            }

            // 3. Xử lý tải lên ảnh đại diện mới qua Cloudinary
            if (dto.AvatarFile != null && dto.AvatarFile.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(dto.AvatarFile);
                if (uploadResult.Error != null)
                {
                    throw new ArgumentException($"Lỗi tải ảnh đại diện lên hệ thống: {uploadResult.Error.Message}");
                }

                // Xóa ảnh cũ trên Cloudinary nếu đã tồn tại
                if (!string.IsNullOrEmpty(user.AvatarPublicId))
                {
                    await _photoService.DeletePhotoAsync(user.AvatarPublicId);
                }

                user.AvatarUrl = uploadResult.SecureUrl.AbsoluteUri;
                user.AvatarPublicId = uploadResult.PublicId;
            }

            // 4. Cập nhật thông tin cơ bản
            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.Email = dto.Email;

            // 5. Cập nhật mật khẩu nếu có truyền
            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            }

            // 6. Cập nhật trạng thái hoạt động nếu có truyền
            if (dto.IsActive.HasValue)
            {
                if (!dto.IsActive.Value && user.UserRoles != null && user.UserRoles.Any(ur => ur.Role != null && ur.Role.Name == SystemRole.Admin))
                {
                    throw new ArgumentException("Không thể khóa tài khoản quản trị viên!");
                }
                user.IsActive = dto.IsActive.Value;
            }

            user.UpdatedAt = DateTimeHelper.VietnamNow;

            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();

            // 7. Cập nhật danh sách vai trò nếu có truyền
            if (dto.RoleIds != null)
            {
                await AssignRolesAsync(user.UserId, dto.RoleIds);
            }

            var updatedUser = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == id, includeProperties: "UserRoles.Role");
            return _mapper.Map<AdminUserDto>(updatedUser);
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
            user.UpdatedAt = DateTimeHelper.VietnamNow;
            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();

            return user.IsActive;
        }

        public async Task AssignRolesAsync(int userId, List<int> roleIds)
        {
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == userId, includeProperties: "UserRoles.Role");
            if (user == null)
                throw new ArgumentException("Người dùng không tồn tại!");

            if (roleIds == null || !roleIds.Any())
                throw new ArgumentException("Người dùng phải có ít nhất một vai trò!");

            var distinctRoleIds = roleIds.Distinct().ToList();

            var validRoles = await _unitOfWork.Role.GetAllAsync(r => distinctRoleIds.Contains(r.RoleId));
            if (validRoles.Count() != distinctRoleIds.Count)
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

            var newUserRoles = distinctRoleIds.Select(roleId => new UserRole { UserId = userId, RoleId = roleId }).ToList();
            foreach (var ur in newUserRoles)
            {
                await _unitOfWork.UserRole.AddAsync(ur);
            }
            
            user.UpdatedAt = DateTimeHelper.VietnamNow;
            _unitOfWork.User.Update(user);

            await _unitOfWork.SaveAsync();
        }
    }
}
