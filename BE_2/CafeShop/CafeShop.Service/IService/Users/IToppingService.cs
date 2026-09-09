using CafeShop.DTO.Topping;
using CafeShop.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.IServices
{
    public interface IToppingService
    {
        //Task<IEnumerable<Topping>> GetAllAsync();
        //Task<Topping> GetByIdAsync(int id);
        //Task AddAsync(Topping entity);
        //Task UpdateAsync(Topping entity);
        //Task DeleteAsync(int id);
        Task<List<ToppingDto>> GetAllToppingsAsync(bool onlyAvailable = false);
        Task<ToppingDto> CreateToppingAsync(CreateUpdateToppingDto request);
        Task<ToppingDto> UpdateToppingAsync(int id, CreateUpdateToppingDto request);
        Task ToggleAvailabilityAsync(int id);
    }
}
