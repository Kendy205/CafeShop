using CafeShop.DTO.Cart;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Order
{
    public class CreateOrderDto
    {
        // CÁCH 1: Nếu khách chọn địa chỉ có sẵn
        public int? AddressId { get; set; }

        // CÁCH 2: Nếu khách chọn từ Mapbox (Backend sẽ tự tạo Address mới)
        public string? NewAddressString { get; set; }
        public string? RecipientName { get; set; }
        public string? Phone { get; set; }

        // BẮT BUỘC: Khoảng cách từ Mapbox để tính phí ship
        public double DistanceKm { get; set; }

        // Thông tin đơn hàng chung
        public string? Note { get; set; }
        public string? PaymentMethod { get; set; } = "COD";

        // Dùng Code thay vì ID cho chuẩn trải nghiệm
        public string? VoucherCode { get; set; }

        // Bắt buộc phải có danh sách món khách muốn Mua Ngay
        public List<CreateOrderDetailDto> Items { get; set; } = new();
    }
    public class CreateOrderDetailDto
    {
        public int ProductId { get; set; }
        public int? SizeId { get; set; }
        public int Quantity { get; set; }

        // Sử dụng ToppingSelectionDto y hệt như bên Giỏ hàng
        public List<ToppingSelectionDto>? Toppings { get; set; } = new();
    }
    public class CheckoutRequestDto
    {
        // CÁCH 1: Nếu khách chọn địa chỉ có sẵn
        public int? AddressId { get; set; }

        // CÁCH 2: Nếu khách chọn từ Mapbox (Backend sẽ tự tạo Address mới)
        public string? NewAddressString { get; set; }
        public string? RecipientName { get; set; }
        public string? Phone { get; set; }

        // Dữ liệu dùng chung để tính tiền
        public double DistanceKm { get; set; } // Mapbox ở FE gửi lên (VD: 12.55)
        public string PaymentMethod { get; set; } = "COD";
        public string? VoucherCode { get; set; }
        public string? Note { get; set; }
    }
    public class OrderDetailDto
    {
        public int OrderItemId { get; set; }
        public int ProductId { get; set; }

        // Hứng dữ liệu từ ProductNameSnapshot
        public string ProductName { get; set; } = string.Empty;

        // Hứng dữ liệu từ SizeNameSnapshot
        public string? SizeName { get; set; }

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; } // Quantity * UnitPrice

        // Danh sách các Topping đi kèm của ly nước này
        public List<OrderItemToppingDto> Toppings { get; set; } = new List<OrderItemToppingDto>();
    }

    public class OrderItemToppingDto
    {
        // Hứng dữ liệu từ ToppingNameSnapshot
        public string ToppingName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }

        // BỔ SUNG: Để lịch sử đơn hàng in ra "200 ml Sữa đặc"
        public int Quantity { get; set; }
        public string? Unit { get; set; }
    }
    public class OrderResponseDto
    {
        public int OrderId { get; set; }
       // public string OrderCode { get; set; } = string.Empty;
        public string CurrentStatus { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
       public List<OrderDetailDto> Items { get; set; } = new List<OrderDetailDto>();
    }
    
}
