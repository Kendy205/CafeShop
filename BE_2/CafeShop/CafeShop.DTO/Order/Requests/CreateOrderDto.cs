using CafeShop.DTO.Cart.Requests;
using System.Collections.Generic;

namespace CafeShop.DTO.Order.Requests
{
    // ================= DTO CHO REQUEST (GỬI LÊN) =================

    // Dùng cho API: POST /api/Order/calculate-fee
    public class CalculateFeeRequestDto
    {
        public double DistanceKm { get; set; }
        public decimal OrderTotal { get; set; } // Phục vụ thuật toán Freeship
    }

    // Gộp chung Checkout và BuyNow - Dùng cho API: POST /api/Order/submit
    public class SubmitOrderRequestDto
    {
        // ================= CỜ PHÂN BIỆT LUỒNG =================
        public bool IsBuyNow { get; set; } // true: Mua ngay | false: Thanh toán từ Giỏ hàng

        // ================= ĐỊA CHỈ & TỌA ĐỘ MAPBOX =================
        public int? AddressId { get; set; }
        public string? NewAddressString { get; set; }
        public string? RecipientName { get; set; }
        public string? Phone { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public double DistanceKm { get; set; } // Khoảng cách xe chạy từ FE gửi

        // ================= THÔNG TIN ĐƠN CHUNG =================
        public string PaymentMethod { get; set; } = "COD";
        public string? VoucherCode { get; set; }
        public string? Note { get; set; }

        // ================= DANH SÁCH MÓN MUA NGAY =================
        // Nếu IsBuyNow = false (mua từ giỏ hàng) thì list này có thể để null
        public List<CreateOrderDetailDto>? Items { get; set; }
    }

    public class CreateOrderDetailDto
    {
        public int ProductId { get; set; }
        public int? SizeId { get; set; }
        public int Quantity { get; set; }
        public List<ToppingSelectionDto>? Toppings { get; set; } = new();
    }
}
