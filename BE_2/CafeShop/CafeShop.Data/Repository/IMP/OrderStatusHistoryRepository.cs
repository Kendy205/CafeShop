using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;

namespace CafeShop.Data.Repository.IMP
{
    public class OrderStatusHistoryRepository : Repository<OrderStatusHistory>, IOrderStatusHistoryRepository
    {
        private readonly ApplicationDbContext _db;

        public OrderStatusHistoryRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
