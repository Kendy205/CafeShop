using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Role.Requests;
using CafeShop.DTO.Role.Responses;
using CafeShop.Model;
using CafeShop.Service.IService.Admin;
using CafeShop.Uitls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Admin
{
    public class AdminRoleService : IAdminRoleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AdminRoleService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<PermissionDto>> GetAllPermissionsAsync()
        {
            var permissions = await _unitOfWork.Permission.GetAllAsync();
            return _mapper.Map<List<PermissionDto>>(permissions);
        }

        public async Task<List<RoleDto>> GetAllRolesAsync()
        {
            var roles = await _unitOfWork.Role.GetAllAsync(includeProperties: "RolePermissions.Permission");
            return _mapper.Map<List<RoleDto>>(roles);
        }

        public async Task<RoleDto?> GetRoleByIdAsync(int id)
        {
            var role = await _unitOfWork.Role.GetFirstOrDefaultAsync(r => r.RoleId == id, includeProperties: "RolePermissions.Permission");
            return role == null ? null : _mapper.Map<RoleDto>(role);
        }

        public async Task<RoleDto> CreateRoleAsync(RoleRequestDto dto)
        {
            var existingRole = await _unitOfWork.Role.GetFirstOrDefaultAsync(r => r.Name.ToLower() == dto.Name.ToLower());
            if (existingRole != null)
                throw new ArgumentException("Tên vai trò đã tồn tại!");

            // 1. Validate permissions upfront trước khi ghi DB
            if (dto.PermissionIds != null && dto.PermissionIds.Any())
            {
                var validPermissions = await _unitOfWork.Permission.GetAllAsync(p => dto.PermissionIds.Contains(p.PermissionId));
                if (validPermissions.Count() != dto.PermissionIds.Count)
                    throw new ArgumentException("Danh sách chức năng có chứa ID không hợp lệ!");
            }

            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var newRole = new Role
                {
                    Name = dto.Name,
                    Description = dto.Description
                };

                await _unitOfWork.Role.AddAsync(newRole);
                await _unitOfWork.SaveAsync(); // Save to generate RoleId

                if (dto.PermissionIds != null && dto.PermissionIds.Any())
                {
                    foreach (var pid in dto.PermissionIds)
                    {
                        await _unitOfWork.RolePermission.AddAsync(new RolePermission { RoleId = newRole.RoleId, PermissionId = pid });
                    }
                    await _unitOfWork.SaveAsync();
                }

                await transaction.CommitAsync();

                var createdRole = await _unitOfWork.Role.GetFirstOrDefaultAsync(r => r.RoleId == newRole.RoleId, includeProperties: "RolePermissions.Permission");
                return _mapper.Map<RoleDto>(createdRole);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<RoleDto> UpdateRoleAsync(int id, RoleRequestDto dto)
        {
            var role = await _unitOfWork.Role.GetFirstOrDefaultAsync(r => r.RoleId == id, includeProperties: "RolePermissions.Permission");
            if (role == null)
                throw new ArgumentException("Vai trò không tồn tại!");

            if (role.Name == SystemRole.Admin || role.Name == SystemRole.User)
            {
                if (role.Name != dto.Name)
                    throw new ArgumentException("Không được phép đổi tên vai trò hệ thống!");
            }
            else
            {
                var existingRole = await _unitOfWork.Role.GetFirstOrDefaultAsync(r => r.Name.ToLower() == dto.Name.ToLower() && r.RoleId != id);
                if (existingRole != null)
                    throw new ArgumentException("Tên vai trò đã tồn tại!");
                
                role.Name = dto.Name;
            }

            if (dto.PermissionIds != null && dto.PermissionIds.Any())
            {
                var validPermissions = await _unitOfWork.Permission.GetAllAsync(p => dto.PermissionIds.Contains(p.PermissionId));
                if (validPermissions.Count() != dto.PermissionIds.Count)
                    throw new ArgumentException("Danh sách chức năng có chứa ID không hợp lệ!");
            }

            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                role.Description = dto.Description;
                _unitOfWork.Role.Update(role);

                // Update permissions
                if (role.RolePermissions != null && role.RolePermissions.Any())
                {
                    _unitOfWork.RolePermission.RemoveRange(role.RolePermissions);
                }

                if (dto.PermissionIds != null && dto.PermissionIds.Any())
                {
                    foreach (var pid in dto.PermissionIds)
                    {
                        await _unitOfWork.RolePermission.AddAsync(new RolePermission { RoleId = id, PermissionId = pid });
                    }
                }

                await _unitOfWork.SaveAsync();
                await transaction.CommitAsync();

                var updatedRole = await _unitOfWork.Role.GetFirstOrDefaultAsync(r => r.RoleId == id, includeProperties: "RolePermissions.Permission");
                return _mapper.Map<RoleDto>(updatedRole);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task DeleteRoleAsync(int id)
        {
            var role = await _unitOfWork.Role.GetFirstOrDefaultAsync(r => r.RoleId == id, includeProperties: "UserRoles");
            if (role == null)
                throw new ArgumentException("Vai trò không tồn tại!");

            if (role.Name == SystemRole.Admin || role.Name == SystemRole.User)
                throw new ArgumentException("Không được phép xóa vai trò hệ thống!");

            if (role.UserRoles != null && role.UserRoles.Any())
                throw new ArgumentException("Không thể xóa vai trò đang được gán cho người dùng!");

            _unitOfWork.Role.Remove(role);
            await _unitOfWork.SaveAsync();
        }
    }
}
