using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IMP
{
    public class FeedbackImageRepository : Repository<FeedbackImage>, IFeedbackImageRepository
    {
        private readonly ApplicationDbContext _context;
        public FeedbackImageRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
