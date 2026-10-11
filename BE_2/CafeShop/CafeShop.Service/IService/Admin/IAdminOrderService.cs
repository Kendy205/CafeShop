using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.Service.Helpers;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminOrderService
    {
        Task<PagedResult<OrderResponseDto>> GetAllOrdersAsync(int pageNumber, int pageSize, string? status = null, DateTime? startDate = null, DateTime? endDate = null, string? keyword = null);
        Task<PagedResult<OrderResponseDto>> GetUserCompletedOrdersAsync(int userId, int pageNumber, int pageSize, DateTime? startDate = null, DateTime? endDate = null);
        Task<OrderResponseDto> GetOrderDetailsAsync(int orderId);
        Task UpdateOrderStatusAsync(int adminId, int orderId, string newStatus, string? cancelReason = null);
    }
}
