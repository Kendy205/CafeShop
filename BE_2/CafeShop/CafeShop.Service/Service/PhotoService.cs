using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.Service
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;
        private readonly int _maxFileSizeMB;
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

        public PhotoService(IOptions<CloudinarySettings> config)
        {
            var acc = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);
            _maxFileSizeMB = config.Value.MaxFileSizeMB > 0 ? config.Value.MaxFileSizeMB : 5;
        }
        
        public async Task<ImageUploadResult> AddPhotoAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File ảnh không hợp lệ hoặc rỗng.");
            }

            // 1. Kiểm tra dung lượng file
            long maxBytes = (long)_maxFileSizeMB * 1024 * 1024;
            if (file.Length > maxBytes)
            {
                throw new ArgumentException($"Dung lượng ảnh vượt quá giới hạn cho phép ({_maxFileSizeMB}MB).");
            }

            // 2. Kiểm tra định dạng phần mở rộng file (extension)
            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"Định dạng file '{extension}' không được hỗ trợ. Chỉ chấp nhận các định dạng: {string.Join(", ", AllowedExtensions)}.");
            }

            // 3. Kiểm tra MIME Content-Type
            if (string.IsNullOrEmpty(file.ContentType) || !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException("File tải lên không phải là định dạng hình ảnh hợp lệ.");
            }

            var uploadResult = new ImageUploadResult();

            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                // Tự động cắt ảnh về hình vuông 500x500 tập trung vào khuôn mặt/vật thể chính
                Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face"),
                Folder = "CafeShop" // Tự tạo folder trên Cloudinary cho gọn
            };

            uploadResult = await _cloudinary.UploadAsync(uploadParams);

            return uploadResult;
        }

        public async Task<DeletionResult> DeletePhotoAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);
            return await _cloudinary.DestroyAsync(deleteParams);
        }
    }
}
