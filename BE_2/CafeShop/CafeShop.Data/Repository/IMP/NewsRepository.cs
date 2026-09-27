using CafeShop.Data;
using CafeShop.Data.Repository.IMP;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;

namespace CafeShop.Repositories.Repository
{
    public class NewsRepository : Repository<News>, INewsRepository
    {
        public NewsRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
