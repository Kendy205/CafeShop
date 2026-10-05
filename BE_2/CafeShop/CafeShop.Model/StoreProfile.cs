using System;
using System.ComponentModel.DataAnnotations;

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
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
