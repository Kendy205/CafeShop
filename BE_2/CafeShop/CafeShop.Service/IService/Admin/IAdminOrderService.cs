using CafeShop.DTO.Order;
using CafeShop.Service.Helpers;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminOrderService
    {
        Task<PagedResult<OrderResponseDto>> GetAllOrdersAsync(int pageNumber, int pageSize, string? status = null);
        Task<OrderResponseDto> GetOrderDetailsAsync(int orderId);
        Task UpdateOrderStatusAsync(int orderId, string newStatus);
    }
}
