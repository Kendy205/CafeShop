using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IMP
{
    public class CartRepository : Repository<Cart>, ICartRepository
    {
        private readonly ApplicationDbContext _context;

        // Truyền context xuống class cha (Repository<T>) bằng từ khóa base
        public CartRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        // Triển khai các hàm đặc thù của ICartRepository ở đây (nếu có)
    }
}
