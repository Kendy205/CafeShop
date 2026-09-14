using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.Service
{
    public class ShippingService : IShippingService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ShippingService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<decimal> CalculateFeeAsync(double distanceKm, decimal? orderTotal = null)
        {
            //if (orderTotal != null && orderTotal >= 200000)
            //{
            //    return 0; // Đơn trên 200k miễn phí ship luôn
            //}
            // 1. Lấy cấu hình từ Database thông qua Repository
            // Lấy dòng cấu hình đầu tiên (thường bảng này chỉ có 1 dòng duy nhất)
            var config = await _unitOfWork.ShippingConfig.GetFirstOrDefaultAsync();

            if (config == null)
                throw new Exception("Hệ thống chưa thiết lập cấu hình phí giao hàng.");

            // 2. Chặn lỗi logic (Bán kính quá xa)
            if (distanceKm > config.MaxDistanceKm)
                throw new ArgumentException($"Quán chỉ hỗ trợ giao hàng trong bán kính {config.MaxDistanceKm}km. Mong bạn thông cảm!");

            // 3. Tính phí cơ bản
            decimal finalFee = config.BaseFee;
            if (distanceKm > config.BaseDistanceKm)
            {
                // Làm tròn lên số Km vượt để tính phí (VD: 3.2km -> tính là vượt 1km)
                double extraKm = Math.Ceiling(distanceKm - config.BaseDistanceKm);
                finalFee += (decimal)extraKm * config.ExtraFeePerKm;
            }

            // 4. Áp dụng thuật toán tính giờ
            TimeZoneInfo vnZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            DateTime currentTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vnZone);

            // Phụ phí đêm
            if (currentTime.Hour >= config.NightHourStart || currentTime.Hour < config.NightHourEnd)
                finalFee += config.NightSurcharge;

            // Phụ phí giờ cao điểm
            if (currentTime.Hour >= config.PeakHourStart && currentTime.Hour <= config.PeakHourEnd)
                finalFee += config.PeakHourSurcharge;

            // Phụ phí cuối tuần
            if (currentTime.DayOfWeek == DayOfWeek.Saturday || currentTime.DayOfWeek == DayOfWeek.Sunday)
                finalFee += config.WeekendSurcharge;

            return finalFee;
        }
    }
}
