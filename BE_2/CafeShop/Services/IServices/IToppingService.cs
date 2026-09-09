using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.Model;

namespace CafeShop.Services.IServices
{
    public interface IToppingService
    {
        Task<IEnumerable<Topping>> GetAllAsync();
        Task<Topping> GetByIdAsync(int id);
        Task AddAsync(Topping entity);
        Task UpdateAsync(Topping entity);
        Task DeleteAsync(int id);
    }
}
