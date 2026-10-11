using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IMP
{
    public class FeedbackReplyRepository : Repository<FeedbackReply>, IFeedbackReplyRepository
    {
        private readonly ApplicationDbContext _context;
        public FeedbackReplyRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
