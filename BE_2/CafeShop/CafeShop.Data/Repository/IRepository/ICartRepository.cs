using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IRepository
{
    // Kế thừa lại toàn bộ hàm của IRepository<T> và chỉ định rõ kiểu Cart
    public interface ICartRepository : IRepository<Cart>
    {
        // Bạn có thể viết thêm các hàm chuyên biệt cho Cart ở đây sau này
        // Ví dụ: void UpdateStatus(int cartId, string status);
    }
}
