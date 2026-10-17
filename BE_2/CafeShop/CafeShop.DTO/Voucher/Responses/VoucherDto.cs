using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.Uitls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Voucher.Responses
{
    public class VoucherDto
    {
        public int VoucherId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Phân loại
        public string TargetType { get; set; } = VoucherTypeTarget.PUBLIC;    // PUBLIC hoặc USER
        public string ApplyType { get; set; } = VoucherApplyType.ORDER;       // "Order" hoặc "Shipping"
        public string DiscountType { get; set; } = DiscountApplyType.FIXED;  // "Fixed" hoặc "Percentage"

        // Giá trị & Điều kiện
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal MaxDiscountAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // Giới hạn toàn hệ thống
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public bool IsActive { get; set; }

        // ==========================================
        // DÀNH CHO VÍ CÁ NHÂN HOẶC ADMIN QUẢN LÝ
        // ==========================================
        public int? UserVoucherId { get; set; }         // Id bảng trung gian UserVouchers
        public int? UsageLimitPerUser { get; set; }     // Số lượt cấp cho mỗi user (đối với mã USER)
        public int? UsedCountPerUser { get; set; }      // Số lượt user này đã dùng (trong ví cá nhân)
        public int? RemainingUsage => UsageLimitPerUser.HasValue
            ? Math.Max(0, UsageLimitPerUser.Value - (UsedCountPerUser ?? 0))
            : null;
        public DateTime? AssignedDate { get; set; }
        public bool IsUsable { get; set; } = true;      // Còn hạn, còn lượt hay không
        public int AssignedUsersCount { get; set; }     // Tổng số user được gán mã này
        public List<int>? UserIds { get; set; }         // Danh sách UserId được gán
    }

    public class CreateVoucherDto
    {
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Mã voucher không được để trống")]
        [System.ComponentModel.DataAnnotations.MaxLength(50, ErrorMessage = "Mã voucher tối đa 50 ký tự")]
        public string Code { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.MaxLength(500, ErrorMessage = "Mô tả tối đa 500 ký tự")]
        public string Description { get; set; } = string.Empty;

        public string TargetType { get; set; } = VoucherTypeTarget.PUBLIC;
        public string ApplyType { get; set; } = VoucherApplyType.ORDER;
        public string DiscountType { get; set; } = DiscountApplyType.FIXED; // Fixed hoặc Percent

        [System.ComponentModel.DataAnnotations.Range(0, double.MaxValue, ErrorMessage = "Giá trị giảm không hợp lệ")]
        public decimal DiscountValue { get; set; }

        [System.ComponentModel.DataAnnotations.Range(0, double.MaxValue, ErrorMessage = "Đơn hàng tối thiểu không hợp lệ")]
        public decimal MinOrderValue { get; set; }

        [System.ComponentModel.DataAnnotations.Range(0, double.MaxValue, ErrorMessage = "Giảm tối đa không hợp lệ")]
        public decimal MaxDiscountAmount { get; set; }

        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Ngày bắt đầu không được để trống")]
        public DateTime StartDate { get; set; }

        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Ngày kết thúc không được để trống")]
        public DateTime EndDate { get; set; }

        [System.ComponentModel.DataAnnotations.Range(1, int.MaxValue, ErrorMessage = "Giới hạn sử dụng phải từ 1 trở lên")]
        public int UsageLimit { get; set; }

        // Dành riêng cho loại USER (Tặng riêng)
        public List<int>? UserIds { get; set; } = new();
        public int? UsageLimitPerUser { get; set; } = 1;
    }

    public class UpdateVoucherDto : CreateVoucherDto
    {
        public bool IsActive { get; set; }
    }

    public class AssignUserVoucherDto
    {
        public int VoucherId { get; set; }
        public List<int> UserIds { get; set; } = new(); // Cho phép gán cho 1 hoặc nhiều user cùng lúc
        public int UsageLimitPerUser { get; set; } = 1;  // Mỗi user được dùng mấy lần (mặc định 1)
    }

    public class VoucherResponseDto
    {
        public int VoucherId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string ApplyType { get; set; } = "ORDER"; // "Order" hoặc "Shipping"
        public decimal DiscountAmount { get; set; }
        public decimal FinalOrderAmount { get; set; } // Tiền nước sau giảm
        public decimal FinalShippingFee { get; set; } // Tiền ship sau giảm
        public decimal FinalTotal { get; set; }        // Tổng thanh toán cuối cùng
    }

    public class CheckVoucherRequestDto
    {
        // Mã giảm giá khách hàng nhập vào (VD: "GIAM15K")
        public string VoucherCode { get; set; } = string.Empty;

        // Cờ phân biệt luồng: 
        // true = Khách ấn "Mua Ngay" (Buy Now)
        // false = Khách ấn thanh toán từ Giỏ hàng (Cart)
        public bool IsBuyNow { get; set; }
        public double DistanceKm { get; set; }

        // Dành riêng cho luồng "Mua Ngay": 
        // Frontend bắt buộc phải gửi danh sách món (Kèm Size, Topping) để Backend tính thử tiền.
        // Nếu IsBuyNow = false (đi từ giỏ hàng), Frontend có thể không truyền trường này hoặc truyền null.
        public List<CreateOrderDetailDto>? Items { get; set; }
    }
}
