using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IMP
{
    public class ShippingConfigRepository :Repository<ShippingConfig>, IShippingConfigRepository
    {
        public ShippingConfigRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
