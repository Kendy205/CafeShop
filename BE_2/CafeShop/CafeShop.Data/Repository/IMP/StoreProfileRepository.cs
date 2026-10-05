using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using CafeShop.Repositories.Repository;

namespace CafeShop.Data.Repository.IMP
{
    public class StoreProfileRepository : Repository<StoreProfile>, IStoreProfileRepository
    {
        private readonly ApplicationDbContext _db;

        public StoreProfileRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
    }
}
