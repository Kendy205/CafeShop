using CafeShop.Data;
using CafeShop.Data.Repository.IMP;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;

namespace CafeShop.Repositories.Repository
{
    public class RoleRepository : Repository<Role>, IRoleRepository
    {
        public RoleRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
