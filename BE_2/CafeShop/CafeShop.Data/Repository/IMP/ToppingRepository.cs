using CafeShop.Data;
using CafeShop.Data.Repository.IMP;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;

namespace CafeShop.Repositories.Repository
{
    public class ToppingRepository : Repository<Topping>, IToppingRepository
    {
        public ToppingRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
