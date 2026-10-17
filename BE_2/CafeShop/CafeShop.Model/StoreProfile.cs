using System;
using System.ComponentModel.DataAnnotations;
using CafeShop.Uitls;

namespace CafeShop.Model
{
    public class StoreProfile
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string StoreName { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Hotline { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string FullAddress { get; set; } = string.Empty;
        
        public double Latitude { get; set; }  
        public double Longitude { get; set; } 
        
        public bool IsAcceptingOrders { get; set; } = true;
        public bool IsRealtimeNotificationEnabled { get; set; } = true;
        public bool IsMaintenanceMode { get; set; } = false;

        public TimeSpan OpenTime { get; set; } = new TimeSpan(7, 0, 0);
        public TimeSpan CloseTime { get; set; } = new TimeSpan(22, 0, 0);
        
        public DateTime CreatedAt { get; set; } = DateTimeHelper.VietnamNow;
        public DateTime UpdatedAt { get; set; } = DateTimeHelper.VietnamNow;

        public bool IsOpenAt(TimeSpan time)
        {
            if (OpenTime <= CloseTime)
            {
                return time >= OpenTime && time <= CloseTime;
            }
            // Trường hợp quán mở xuyên đêm qua ngày hôm sau (VD: 20:00 -> 02:00)
            return time >= OpenTime || time <= CloseTime;
        }

        public (bool CanAccept, string? Reason) CheckCanAcceptOrders(DateTime? now = null)
        {
            if (IsMaintenanceMode)
            {
                return (false, "Hệ thống cửa hàng hiện đang bảo trì.");
            }

            if (!IsAcceptingOrders)
            {
                return (false, "Cửa hàng hiện đang tạm ngưng nhận đơn hàng mới.");
            }

            var currentTime = (now ?? DateTimeHelper.VietnamNow).TimeOfDay;
            if (!IsOpenAt(currentTime))
            {
                return (false, $"Cửa hàng hiện đang đóng cửa (Giờ mở cửa: {OpenTime:hh\\:mm} - {CloseTime:hh\\:mm}).");
            }

            return (true, null);
        }
    }
}
