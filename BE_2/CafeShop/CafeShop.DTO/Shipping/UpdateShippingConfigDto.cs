using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Shipping
{
    public class UpdateShippingConfigDto
    {
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá trị không hợp lệ")]
        public decimal BaseFee { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá trị không hợp lệ")]
        public double BaseDistanceKm { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá trị không hợp lệ")]
        public decimal ExtraFeePerKm { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá trị không hợp lệ")]
        public double MaxDistanceKm { get; set; }

        [Required]
        public bool IsFreeShippingEnabled { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá trị không hợp lệ")]
        public decimal FreeShippingThreshold { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá trị không hợp lệ")]
        public decimal NightSurcharge { get; set; }

        [Required]
        [Range(0, 23, ErrorMessage = "Giờ không hợp lệ")]
        public int NightHourStart { get; set; }

        [Required]
        [Range(0, 23, ErrorMessage = "Giờ không hợp lệ")]
        public int NightHourEnd { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá trị không hợp lệ")]
        public decimal PeakHourSurcharge { get; set; }

        [Required]
        [Range(0, 23, ErrorMessage = "Giờ không hợp lệ")]
        public int PeakHourStart { get; set; }

        [Required]
        [Range(0, 23, ErrorMessage = "Giờ không hợp lệ")]
        public int PeakHourEnd { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá trị không hợp lệ")]
        public decimal WeekendSurcharge { get; set; }
    }
}
