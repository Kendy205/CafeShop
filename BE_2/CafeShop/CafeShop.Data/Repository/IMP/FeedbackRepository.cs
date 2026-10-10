using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using Microsoft.EntityFrameworkCore;
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

        public async Task<(int TotalReviews, double AverageRating, int Five, int Four, int Three, int Two, int One)> GetFeedbackSummaryForProductAsync(int productId)
        {
            var query = dbSet.Where(f => f.ProductId == productId && f.IsVisible);
            
            var totalReviews = await query.CountAsync();
            if (totalReviews == 0) return (0, 0, 0, 0, 0, 0, 0);

            var avgRating = await query.AverageAsync(f => (double)f.Rating);
            
            var groups = await query
                .GroupBy(f => f.Rating)
                .Select(g => new { Rating = g.Key, Count = g.Count() })
                .ToListAsync();

            int five = groups.FirstOrDefault(g => g.Rating == 5)?.Count ?? 0;
            int four = groups.FirstOrDefault(g => g.Rating == 4)?.Count ?? 0;
            int three = groups.FirstOrDefault(g => g.Rating == 3)?.Count ?? 0;
            int two = groups.FirstOrDefault(g => g.Rating == 2)?.Count ?? 0;
            int one = groups.FirstOrDefault(g => g.Rating == 1)?.Count ?? 0;

            return (totalReviews, avgRating, five, four, three, two, one);
        }

        public async Task<bool> ExistsByOrderDetailIdAsync(int orderDetailId)
        {
            return await dbSet.AnyAsync(f => f.OrderDetailId == orderDetailId);
        }
    }
}
