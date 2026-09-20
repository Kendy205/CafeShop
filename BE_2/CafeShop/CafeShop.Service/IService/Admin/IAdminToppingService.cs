using CafeShop.DTO.Topping;
using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.Model;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminToppingService
    {
        Task<List<ToppingDto>> GetAllToppingsAsync();
        Task<Topping> GetByIdAsync(int id);
        Task<ToppingDto> CreateToppingAsync(CreateUpdateToppingDto request);
        Task<ToppingDto> UpdateToppingAsync(int id, CreateUpdateToppingDto request);
        Task ToggleAvailabilityAsync(int id);
        Task DeleteAsync(int id);
    }
}
