using CoffeeShop.Models;
using CoffeeShop.Repositories.IRepository;

namespace CoffeeShop.Repositories.Repository
{
    public class VoucherRepository : Repository<Voucher>, IVoucherRepository
    {
        public VoucherRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
