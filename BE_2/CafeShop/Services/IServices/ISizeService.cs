using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.Model;

namespace CafeShop.Services.IServices
{
    public interface ISizeService
    {
        Task<IEnumerable<Size>> GetAllAsync();
        Task<Size> GetByIdAsync(int id);
        Task AddAsync(Size entity);
        Task UpdateAsync(Size entity);
        Task DeleteAsync(int id);
    }
}
