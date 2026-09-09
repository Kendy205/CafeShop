using CoffeeShop.Models;
using CoffeeShop.Repositories.IRepository;

namespace CoffeeShop.Repositories.Repository
{
    public class OrderDetailToppingRepository : Repository<OrderDetailTopping>, IOrderDetailToppingRepository
    {
        public OrderDetailToppingRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
