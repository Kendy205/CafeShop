using CafeShop.Data;
using CafeShop.Data.Repository.IMP;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;

namespace CafeShop.Repositories.Repository
{
    public class OrderDetailToppingRepository : Repository<OrderDetailTopping>, IOrderDetailToppingRepository
    {
        public OrderDetailToppingRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
