using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.Model;

namespace CafeShop.Services.IServices
{
    public interface IVoucherService
    {
        Task<IEnumerable<Voucher>> GetAllAsync();
        Task<Voucher> GetByIdAsync(int id);
        Task AddAsync(Voucher entity);
        Task UpdateAsync(Voucher entity);
        Task DeleteAsync(int id);
    }
}
