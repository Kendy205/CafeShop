using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IMP
{
    public class FeedbackRepository : Repository<Feedback>, IFeedbackRepository
    {
        private readonly ApplicationDbContext _context;
        public FeedbackRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
