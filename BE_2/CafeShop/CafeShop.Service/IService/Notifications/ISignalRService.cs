using System.Threading.Tasks;
using CafeShop.DTO.Notifications;

namespace CafeShop.Service.IService.Notifications
{
    public interface ISignalRService
    {
        Task NotifyOrderEventAsync(OrderNotificationDto notification);
        Task NotifyNewOrderToAdminsAsync(int orderId, string customerName);
        Task NotifyOrderStatusToUserAsync(int userId, int orderId, string newStatus);
    }
}
