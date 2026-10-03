using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Shipping
{
    public class ShippingConfigDto
    {
        public int Id { get; set; }
        public decimal BaseFee { get; set; }
        public double BaseDistanceKm { get; set; }
        public decimal ExtraFeePerKm { get; set; }
        public double MaxDistanceKm { get; set; }

        public bool IsFreeShippingEnabled { get; set; }
        public decimal FreeShippingThreshold { get; set; }

        public decimal NightSurcharge { get; set; }
        public int NightHourStart { get; set; }
        public int NightHourEnd { get; set; }

        public decimal PeakHourSurcharge { get; set; }
        public int PeakHourStart { get; set; }
        public int PeakHourEnd { get; set; }

        public decimal WeekendSurcharge { get; set; }
    }
}
