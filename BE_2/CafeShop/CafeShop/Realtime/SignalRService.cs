using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using CafeShop.DTO.Notifications;
using CafeShop.Hubs;
using CafeShop.Service.IService.Notifications;
using CafeShop.Uitls;

namespace CafeShop.Realtime
{
    public class SignalRService : ISignalRService
    {
        private readonly IHubContext<NotificationHub> _hub;
        private readonly ILogger<SignalRService> _logger;

        public SignalRService(IHubContext<NotificationHub> hub, ILogger<SignalRService> logger)
        {
            _hub = hub;
            _logger = logger;
        }

        public async Task NotifyNewOrderToAdminsAsync(int orderId, string customerName)
        {
            try
            {
                var dto = new AdminNotificationDto(
                    orderId,
                    $"Khách hàng {customerName} vừa đặt đơn hàng mới (#{orderId}).",
                    "NewOrder"
                );
                await _hub.Clients.Group(NotificationEvents.AdminsGroup)
                    .SendAsync(NotificationEvents.Admin, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gửi thông báo đơn mới #{OrderId} thất bại", orderId);
            }
        }

        public async Task NotifyOrderStatusToUserAsync(int userId, int orderId, string newStatus)
        {
            try
            {
                var statusVi = OrderStatus.ToVietnamese(newStatus);
                var dto = new UserNotificationDto(
                    orderId,
                    newStatus,
                    $"Đơn hàng #{orderId} của bạn đã được cập nhật sang trạng thái: {statusVi}.",
                    "OrderStatusChanged"
                );
                // Chỉ gửi 1 lần duy nhất vào group của User
                await _hub.Clients.Group(NotificationEvents.UserGroup(userId))
                    .SendAsync(NotificationEvents.User, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gửi thông báo trạng thái đơn #{OrderId} cho user {UserId} thất bại", orderId, userId);
            }
        }
    }
}