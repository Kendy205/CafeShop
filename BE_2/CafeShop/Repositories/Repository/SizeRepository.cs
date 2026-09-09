using CoffeeShop.Models;
using CoffeeShop.Repositories.IRepository;

namespace CoffeeShop.Repositories.Repository
{
    public class SizeRepository : Repository<Size>, ISizeRepository
    {
        public SizeRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
