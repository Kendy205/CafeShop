using System;

namespace CafeShop.DTO.StoreProfile
{
    public class StoreProfileDto
    {
        public int Id { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public string Hotline { get; set; } = string.Empty;
        public string FullAddress { get; set; } = string.Empty;
        public double Latitude { get; set; }  
        public double Longitude { get; set; } 
        public bool IsAcceptingOrders { get; set; }
        public bool IsRealtimeNotificationEnabled { get; set; }
        public bool IsMaintenanceMode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
