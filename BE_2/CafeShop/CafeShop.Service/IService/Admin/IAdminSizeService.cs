using CafeShop.DTO.Size;
using CafeShop.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminSizeService
    {
        Task<List<SizeDto>> GetAllSizesAsync();
        Task<SizeDto> CreateSizeAsync(CreateUpdateSizeDto request);
        Task<SizeDto> UpdateSizeAsync(int id, CreateUpdateSizeDto request);
        Task DeleteSizeAsync(int id);
    }
}
