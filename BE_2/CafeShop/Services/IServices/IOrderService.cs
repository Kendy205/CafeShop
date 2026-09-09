using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.Model;

namespace CafeShop.Services.IServices
{
    public interface IOrderService
    {
        Task<IEnumerable<Order>> GetAllAsync();
        Task<Order> GetByIdAsync(int id);
        Task AddAsync(Order entity);
        Task UpdateAsync(Order entity);
        Task DeleteAsync(int id);
    }
}
