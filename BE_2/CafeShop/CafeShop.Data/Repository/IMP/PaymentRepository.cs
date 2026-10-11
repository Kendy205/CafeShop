using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using CafeShop.Repositories.Repository;

namespace CafeShop.Data.Repository.IMP
{
    public class PaymentRepository : Repository<Payment>, IPaymentRepository
    {
        public PaymentRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
