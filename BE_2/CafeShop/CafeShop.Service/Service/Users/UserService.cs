using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.User;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.IService;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Service.Service
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPhotoService _photoService;
        private readonly IMapper _mapper;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;

        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _unitOfWork.User.GetAllAsync();
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _unitOfWork.User.GetFirstOrDefaultAsync(p=>p.UserId==id);
        }

        public async Task AddAsync(User entity)
        {
            await _unitOfWork.User.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(User entity)
        {
            _unitOfWork.User.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.User.GetFirstOrDefaultAsync(p=>p.UserId==id);
            if (entity != null)
            {
                _unitOfWork.User.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
        public async Task<UserProfileDto> GetProfileAsync(int userId)
        {
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new ArgumentException("Không tìm thấy thông tin tài khoản!");

            return _mapper.Map<UserProfileDto>(user);
        }

        public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto request)
        {
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new ArgumentException("Không tìm thấy thông tin tài khoản!");

            // 1. Cập nhật thông tin cơ bản
            user.FullName = request.FullName;
            user.PhoneNumber = request.PhoneNumber;

            // 2. XỬ LÝ ẢNH ĐẠI DIỆN VỚI CLOUDINARY
            if (request.AvatarFile != null && request.AvatarFile.Length > 0)
            {
                // Bước 2.1: Tải ảnh MỚI lên Cloudinary
                var uploadResult = await _photoService.AddPhotoAsync(request.AvatarFile);

                if (uploadResult.Error != null)
                {
                    throw new Exception($"Lỗi tải ảnh lên hệ thống: {uploadResult.Error.Message}");
                }

                // Bước 2.2: Xóa ảnh CŨ trên Cloudinary (Nếu user đã từng có ảnh trước đó)
                if (!string.IsNullOrEmpty(user.AvatarPublicId))
                {
                    await _photoService.DeletePhotoAsync(user.AvatarPublicId);
                }

                // Bước 2.3: Lưu URL và PublicId MỚI vào Database
                user.AvatarUrl = uploadResult.SecureUrl.AbsoluteUri;
                user.AvatarPublicId = uploadResult.PublicId;
            }

            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<UserProfileDto>(user);
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto request)
        {
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new ArgumentException("Không tìm thấy thông tin tài khoản!");

            // Kiểm tra mật khẩu cũ
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);

            if (!isPasswordValid)
                throw new ArgumentException("Mật khẩu hiện tại không chính xác!");

            // Cập nhật mật khẩu mới
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();
        }
    }
}

