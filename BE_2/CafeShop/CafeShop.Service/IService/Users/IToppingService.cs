using CafeShop.DTO.Topping;
using CafeShop.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.IServices
{
    public interface IToppingService
    {
        Task<IEnumerable<Topping>> GetAllAsync();
        Task<Topping> GetByIdAsync(int id);
        Task<List<ToppingDto>> GetAllToppingsAsync(bool onlyAvailable = true);
    }
}
