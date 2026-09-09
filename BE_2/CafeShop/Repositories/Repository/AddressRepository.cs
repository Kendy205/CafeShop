using CoffeeShop.Models;
using CoffeeShop.Repositories.IRepository;

namespace CoffeeShop.Repositories.Repository
{
    public class AddressRepository : Repository<Address>, IAddressRepository
    {
        public AddressRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
