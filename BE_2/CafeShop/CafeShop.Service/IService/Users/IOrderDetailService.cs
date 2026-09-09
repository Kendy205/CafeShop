using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.Model;

namespace CafeShop.Services.IServices
{
    public interface IOrderDetailService
    {
        Task<IEnumerable<OrderDetail>> GetAllAsync();
        Task<OrderDetail> GetByIdAsync(int id);
        Task AddAsync(OrderDetail entity);
        Task UpdateAsync(OrderDetail entity);
        Task DeleteAsync(int id);
    }
}
