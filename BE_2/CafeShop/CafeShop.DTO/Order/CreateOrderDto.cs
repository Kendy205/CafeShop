using CafeShop.DTO.Cart;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Order
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

    // ================= DTO CHO RESPONSE (TRẢ VỀ) =================

    // Dùng chung cho kết quả của Submit Order và Get My Orders
    public class OrderResponseDto
    {
        public int OrderId { get; set; }
        public int CustomerId { get; set; }
        public int AddressId { get; set; }
        public double DistanceKm { get; set; }
        public decimal ShippingFee { get; set; }
        public DateTime OrderDate { get; set; }
        public string CurrentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? Note { get; set; }
        public int? VoucherId { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }

        public List<OrderDetailDto> Items { get; set; } = new();
    }

    public class OrderDetailDto
    {
        public int OrderDetailId { get; set; } // KHÓA QUAN TRỌNG: Dùng để gửi Feedback
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int? SizeId { get; set; }
        public string? SizeName { get; set; }
        public int Quantity { get; set; }

        public bool IsReviewed { get; set; } // FE check cờ này để hiện/ẩn nút Đánh giá

        public decimal UnitPrice { get; set; }
        public decimal TotalItemPrice => Quantity * UnitPrice;

        public List<OrderItemToppingDto> Toppings { get; set; } = new();
    }

    public class OrderItemToppingDto
    {
        public int ToppingId { get; set; }
        public string ToppingName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Unit { get; set; }
        public string? ImageUrl { get; set; }
    }

}
