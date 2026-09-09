using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.Model;

namespace CafeShop.Services.IServices
{
    public interface IAddressService
    {
        Task<IEnumerable<Address>> GetAllAsync();
        Task<Address> GetByIdAsync(int id);
        Task AddAsync(Address entity);
        Task UpdateAsync(Address entity);
        Task DeleteAsync(int id);
    }
}
