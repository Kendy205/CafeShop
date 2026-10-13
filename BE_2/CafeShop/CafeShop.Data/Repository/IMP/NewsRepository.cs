using System.Linq;
using Microsoft.EntityFrameworkCore;
using CafeShop.Data;
using CafeShop.Data.Repository.IMP;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using System.Threading.Tasks;

namespace CafeShop.Repositories.Repository
{
    public class NewsRepository : Repository<News>, INewsRepository
    {
        private readonly ApplicationDbContext _db;

        public NewsRepository(ApplicationDbContext context) : base(context)
        {
            _db = context;
        }

        private IQueryable<News> BuildQuery(string? keyword, string? status, bool onlyPublished)
        {
            var query = _db.News.AsNoTracking().Where(n => !n.IsDeleted);

            if (onlyPublished)
            {
                query = query.Where(n => n.Status == "Published" && n.PublishedAt != null && n.PublishedAt <= CafeShop.Uitls.DateTimeHelper.VietnamNow);
            }
            else if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(n => n.Status == status);
            }

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(n => n.Title != null && n.Title.Contains(keyword));
            }

            return query;
        }

        public async Task<int> CountNewsSummaryAsync(string? keyword, string? status, bool onlyPublished)
        {
            return await BuildQuery(keyword, status, onlyPublished).CountAsync();
        }

        public async Task<System.Collections.Generic.IEnumerable<NewsSummaryModel>> GetNewsSummaryAsync(
            string? keyword, 
            string? status, 
            bool onlyPublished,
            int pageNumber, 
            int pageSize)
        {
            var query = BuildQuery(keyword, status, onlyPublished);

            return await query
                .OrderByDescending(n => onlyPublished ? n.PublishedAt : n.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new NewsSummaryModel
                {
                    NewsId = n.NewsId,
                    Title = n.Title,
                    Slug = n.Slug,
                    Summary = n.Summary,
                    ImageUrl = n.ImageUrl,
                    Status = n.Status,
                    PublishedAt = n.PublishedAt,
                    CreatedAt = n.CreatedAt,
                    ViewCount = n.ViewCount,
                    AuthorName = n.User != null ? (n.User.FullName ?? n.User.Username) : "Unknown"
                })
                .ToListAsync();
        }
    }
}
