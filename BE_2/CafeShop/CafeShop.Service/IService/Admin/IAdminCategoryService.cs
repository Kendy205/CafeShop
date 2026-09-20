using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.DTO.Admin;
using CafeShop.Model;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminCategoryService
    {
        Task<IEnumerable<Category>> GetAllAsync();
        Task<Category> GetByIdAsync(int id);
        Task<Category> AddAsync(CreateCategoryDto dto);
        Task<Category> UpdateAsync(int id, UpdateCategoryDto dto);
        Task DeleteAsync(int id);
    }
}
