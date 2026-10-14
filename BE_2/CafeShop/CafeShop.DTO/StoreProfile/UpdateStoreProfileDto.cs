using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.StoreProfile
{
    public class UpdateStoreProfileDto
    {
        [Required(ErrorMessage = "Tên quán không được để trống")]
        [MaxLength(255)]
        public string StoreName { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string Hotline { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string FullAddress { get; set; } = string.Empty;
        
        public double Latitude { get; set; }  
        public double Longitude { get; set; } 
        
        public bool IsAcceptingOrders { get; set; }
        public bool IsRealtimeNotificationEnabled { get; set; }
        public bool IsMaintenanceMode { get; set; }

        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
    }
}
