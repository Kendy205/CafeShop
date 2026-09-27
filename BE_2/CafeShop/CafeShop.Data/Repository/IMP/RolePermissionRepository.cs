using CafeShop.Data;
using CafeShop.Data.Repository.IMP;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;

namespace CafeShop.Repositories.Repository
{
    public class RolePermissionRepository : Repository<RolePermission>, IRolePermissionRepository
    {
        public RolePermissionRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
