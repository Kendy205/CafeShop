using CafeShop.DTO.Size;
using CafeShop.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.IServices
{
    public interface ISizeService
    {
        //Task<IEnumerable<Size>> GetAllAsync();
        //Task<Size> GetByIdAsync(int id);
        //Task AddAsync(Size entity);
        //Task UpdateAsync(Size entity);
        //Task DeleteAsync(int id);
        Task<List<SizeDto>> GetAllSizesAsync();
        Task<SizeDto> CreateSizeAsync(CreateUpdateSizeDto request);
        Task<SizeDto> UpdateSizeAsync(int id, CreateUpdateSizeDto request);
        Task DeleteSizeAsync(int id);
    }
}
