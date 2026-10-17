using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminCategoryService
    {
        Task<List<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(int id);
        Task<CategoryDto> AddAsync(CreateCategoryDto dto);
        Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto);
        Task DeleteAsync(int id);
    }
}
