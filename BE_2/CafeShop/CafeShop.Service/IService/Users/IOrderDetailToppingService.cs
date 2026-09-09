using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.Model;

namespace CafeShop.Services.IServices
{
    public interface IOrderDetailToppingService
    {
        Task<IEnumerable<OrderDetailTopping>> GetAllAsync();
        Task<OrderDetailTopping> GetByIdAsync(int id);
        Task AddAsync(OrderDetailTopping entity);
        Task UpdateAsync(OrderDetailTopping entity);
        Task DeleteAsync(int id);
    }
}
