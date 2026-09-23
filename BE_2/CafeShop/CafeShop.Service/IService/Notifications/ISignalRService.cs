using System.Threading.Tasks;

namespace CafeShop.Service.IService.Notifications
{
    public interface ISignalRService
    {
        Task NotifyNewOrderToAdminsAsync(int orderId, string customerName);
        Task NotifyOrderStatusToUserAsync(int userId, int orderId, string newStatus);
    }
}
