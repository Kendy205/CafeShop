namespace CafeShop.DTO.Notifications
{
    public record AdminNotificationDto(int OrderId, string Message, string Type);
    public record UserNotificationDto(int OrderId, string Status, string Message, string Type);

    public class OrderNotificationDto
    {
        public int OrderId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public decimal TotalAmount { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentStatus { get; set; }
        public string? OrderStatus { get; set; }
        public string Message { get; set; } = string.Empty;
        public string NotificationType { get; set; } = string.Empty; // "NewOrder", "OrderCancelled", "PaymentSuccess", "OrderStatusChanged"
        public int? ActionUserId { get; set; }
        public string? ActionUserName { get; set; }
        public System.DateTime CreatedAt { get; set; }
    }
}