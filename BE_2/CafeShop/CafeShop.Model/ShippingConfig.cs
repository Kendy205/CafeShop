using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class ShippingConfig
    {
        [Key]
        public int Id { get; set; }

        // Cấu hình cơ bản
        public decimal BaseFee { get; set; } = 5000;         // Phí cho số Km đầu
        public double BaseDistanceKm { get; set; } = 5.0;    // Số Km đầu tiên
        public decimal ExtraFeePerKm { get; set; } = 2000;   // Phí cộng thêm mỗi Km vượt
        public double MaxDistanceKm { get; set; } = 10.0;    // Giới hạn bán kính giao hàng

        // Cấu hình Freeship
        public bool IsFreeShippingEnabled { get; set; } = true;
        public decimal FreeShippingThreshold { get; set; } = 200000;

        // Cấu hình phụ phí (Surcharge)
        public decimal NightSurcharge { get; set; } = 2000;
        public int NightHourStart { get; set; } = 22;        // Bắt đầu 22h
        public int NightHourEnd { get; set; } = 6;           // Kết thúc 6h sáng

        public decimal PeakHourSurcharge { get; set; } = 0;
        public int PeakHourStart { get; set; } = 11;
        public int PeakHourEnd { get; set; } = 13;

        public decimal WeekendSurcharge { get; set; } = 3000;
    }
}
