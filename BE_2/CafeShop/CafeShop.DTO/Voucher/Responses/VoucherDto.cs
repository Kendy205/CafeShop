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

        // PhĂ¢n loáº¡i
        public string TargetType { get; set; } = VoucherTypeTarget.PUBLIC;    // PUBLIC hoáº·c USER
        public string ApplyType { get; set; } = VoucherApplyType.ORDER;    // "Order" hoáº·c "Shipping"
        public string DiscountType { get; set; } = DiscountApplyType.FIXED;// "Fixed" hoáº·c "Percentage"

        // GiĂ¡ trá»‹ & Äiá»u kiá»‡n
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal MaxDiscountAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // Giá»›i háº¡n toĂ n há»‡ thá»‘ng
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public bool IsActive { get; set; }

        // ==========================================
        // DĂ€NH CHO VĂ CĂ NHĂ‚N (Null náº¿u lĂ  mĂ£ Public)
        // ==========================================
        public int? UserVoucherId { get; set; }         // Id báº£ng trung gian UserVouchers
        public int? UsageLimitPerUser { get; set; }     // Sá»‘ lÆ°á»£t cáº¥p cho user nĂ y
        public int? UsedCountPerUser { get; set; }      // Sá»‘ lÆ°á»£t user nĂ y Ä‘Ă£ dĂ¹ng
        public int? RemainingUsage => UsageLimitPerUser.HasValue
            ? Math.Max(0, UsageLimitPerUser.Value - (UsedCountPerUser ?? 0))
            : null;
        public DateTime? AssignedDate { get; set; }
        public bool IsUsable { get; set; } = true;      // CĂ²n háº¡n, cĂ²n lÆ°á»£t hay khĂ´ng
    }

    public class CreateVoucherDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TargetType { get; set; } = VoucherTypeTarget.PUBLIC;
        public string ApplyType { get; set; } = VoucherApplyType.ORDER;
        public string DiscountType { get; set; } = DiscountApplyType.FIXED; // Fixed hoáº·c Percent
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
        public List<int> UserIds { get; set; } = new(); // Cho phĂ©p gĂ¡n cho 1 hoáº·c nhiá»u user cĂ¹ng lĂºc
        public int UsageLimitPerUser { get; set; } = 1;  // Má»—i user Ä‘Æ°á»£c dĂ¹ng máº¥y láº§n (máº·c Ä‘á»‹nh 1)
    }
    public class VoucherResponseDto
    {
        public int VoucherId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string ApplyType { get; set; } = "Order"; // "Order" hoáº·c "Shipping"
        public decimal DiscountAmount { get; set; }
        public decimal FinalOrderAmount { get; set; } // Tiá»n nÆ°á»›c sau giáº£m
        public decimal FinalShippingFee { get; set; } // Tiá»n ship sau giáº£m
        public decimal FinalTotal { get; set; }        // Tá»•ng thanh toĂ¡n cuá»‘i cĂ¹ng
    }
    public class CheckVoucherRequestDto
    {
        // MĂ£ giáº£m giĂ¡ khĂ¡ch hĂ ng nháº­p vĂ o (VD: "GIAM15K")
        public string VoucherCode { get; set; } = string.Empty;

        // Cá» phĂ¢n biá»‡t luá»“ng: 
        // true = KhĂ¡ch áº¥n "Mua Ngay" (Buy Now)
        // false = KhĂ¡ch áº¥n thanh toĂ¡n tá»« Giá» hĂ ng (Cart)
        public bool IsBuyNow { get; set; }
        public double DistanceKm { get; set; }

        // DĂ nh riĂªng cho luá»“ng "Mua Ngay": 
        // Frontend báº¯t buá»™c pháº£i gá»­i danh sĂ¡ch mĂ³n (KĂ¨m Size, Topping) Ä‘á»ƒ Backend tĂ­nh thá»­ tiá»n.
        // Náº¿u IsBuyNow = false (Ä‘i tá»« giá» hĂ ng), Frontend cĂ³ thá»ƒ khĂ´ng truyá»n trÆ°á»ng nĂ y hoáº·c truyá»n null.
        public List<CreateOrderDetailDto>? Items { get; set; }
    }
   
}

