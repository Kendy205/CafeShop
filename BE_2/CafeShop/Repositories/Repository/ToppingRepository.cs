using CoffeeShop.Models;
using CoffeeShop.Repositories.IRepository;

namespace CoffeeShop.Repositories.Repository
{
    public class ToppingRepository : Repository<Topping>, IToppingRepository
    {
        public ToppingRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
