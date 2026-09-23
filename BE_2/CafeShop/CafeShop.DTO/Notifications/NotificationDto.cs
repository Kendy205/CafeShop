namespace CafeShop.DTO.Notifications
{
    public record AdminNotificationDto(int OrderId, string Message, string Type);
    public record UserNotificationDto(int OrderId, string Status, string Message, string Type);
}