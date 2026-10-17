using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.DTO.Category.Responses;

namespace CafeShop.Services.IServices
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(int id);
    }
}
