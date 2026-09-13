using CafeShop.DTO.Order;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.IServices
{
    public interface IOrderService
    {
        //Task<IEnumerable<Order>> GetAllAsync();
        //Task<Order> GetByIdAsync(int id);
        //Task AddAsync(Order entity);
        //Task UpdateAsync(Order entity);
        //Task DeleteAsync(int id);

        Task<OrderResponseDto> SubmitOrderAsync(int userId, SubmitOrderRequestDto request);

        Task<PagedResult<OrderResponseDto>> GetMyOrdersAsync(int userId, int pageNumber, int pageSize, string? status = null);
        Task CancelOrderAsync(int userId, int orderId);
        //Task<VoucherResponseDto> CheckVoucherAsync(int userId, CheckVoucherRequestDto request);
        //Task<OrderResponseDto> BuyNowAsync(int userId, CreateOrderDto request);
    }

}
