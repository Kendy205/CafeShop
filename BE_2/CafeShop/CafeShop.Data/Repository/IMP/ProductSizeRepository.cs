using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IMP
{
    public class ProductSizeRepository : Repository<ProductSize>, IProductSizeRepository
    {
        public ProductSizeRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
