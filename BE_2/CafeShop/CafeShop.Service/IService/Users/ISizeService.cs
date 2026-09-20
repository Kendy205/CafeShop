using CafeShop.DTO.Size;
using CafeShop.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Services.IServices
{
    public interface ISizeService
    {
        Task<List<SizeDto>> GetAllSizesAsync();
    }
}
