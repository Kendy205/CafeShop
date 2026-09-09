using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CafeShop.Service.Helpers
{
    public class ApiResponse<T>
    {
        /// <summary>Trạng thái: true (thành công) / false (thất bại)</summary>
        public bool Success { get; set; }

        /// <summary>Mã lỗi HTTP (200, 400, 401, 404, 500...)</summary>
        public int StatusCode { get; set; }

        /// <summary>Thông báo cho người dùng (VD: "Đăng nhập thành công", "Không tìm thấy đồ uống")</summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>Dữ liệu chính trả về (Danh sách đồ uống, thông tin user...)</summary>
        public T? Data { get; set; }

        /// <summary>Chi tiết lỗi (nếu có, thường dùng cho lỗi Validate form)</summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public object? Errors { get; set; }

        // ── CÁC HÀM HỖ TRỢ TẠO NHANH (FACTORY METHODS) ──────────────────────

        public static ApiResponse<T> Succeeded(T data, int statusCode = 200, string message = "Thành công")
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = statusCode,
                Message = message,
                Data = data
            };
        }

        public static ApiResponse<T> Failed(string message, int statusCode = 400, object? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = statusCode,
                Message = message,
                Data = default,
                Errors = errors
            };
        }
    }
}

