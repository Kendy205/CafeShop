using CafeShop.DTO.Order;
using CafeShop.Uitls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Voucher
{
    public class VoucherDto
    {
        public int VoucherId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Phân loại
        public string TargetType { get; set; } = VoucherTypeTarget.PUBLIC;    // "All" / "Public" hoặc "User"
        public string ApplyType { get; set; } = VoucherApplyType.ORDER;    // "Order" hoặc "Shipping"
        public string DiscountType { get; set; } = DiscountApplyType.FIXED;// "Fixed" hoặc "Percentage"

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
        // DÀNH CHO VÍ CÁ NHÂN (Null nếu là mã Public)
        // ==========================================
        public int? UserVoucherId { get; set; }         // Id bảng trung gian UserVouchers
        public int? UsageLimitPerUser { get; set; }     // Số lượt cấp cho user này
        public int? UsedCountPerUser { get; set; }      // Số lượt user này đã dùng
        public int? RemainingUsage => UsageLimitPerUser.HasValue
            ? Math.Max(0, UsageLimitPerUser.Value - (UsedCountPerUser ?? 0))
            : null;
        public DateTime? AssignedDate { get; set; }
        public bool IsUsable { get; set; } = true;      // Còn hạn, còn lượt hay không
    }

    public class CreateVoucherDto
    {
        public string Code { get; set; } = string.Empty;
        public string DiscountType { get; set; } = DiscountApplyType.FIXED; // Fixed hoặc Percent
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal MaxDiscountAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
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
        public string ApplyType { get; set; } = "Order"; // "Order" hoặc "Shipping"
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
