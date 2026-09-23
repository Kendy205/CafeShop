using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IMP
{
    public class ProductToppingRepository : Repository<ProductTopping>, IProductToppingRepository
    {
        public ProductToppingRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
