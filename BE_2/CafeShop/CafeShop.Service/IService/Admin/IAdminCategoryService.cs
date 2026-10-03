using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.DTO.Category;
using CafeShop.DTO.Product;
using CafeShop.DTO.User;
using CafeShop.DTO.Order;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard;
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
