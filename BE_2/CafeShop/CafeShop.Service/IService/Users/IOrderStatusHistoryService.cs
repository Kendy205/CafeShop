using CafeShop.DTO.Order;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Users
{
    public interface IOrderStatusHistoryService
    {
        Task AddHistoryAsync(int orderId, string status, int changedByUserId, string? note = null);
        Task<List<OrderStatusHistoryDto>> GetOrderHistoryAsync(int orderId);
    }
}
