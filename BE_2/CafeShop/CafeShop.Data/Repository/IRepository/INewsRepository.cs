using CafeShop.Model;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Repositories.IRepository
{
    public interface INewsRepository : IRepository<News>
    {
        Task<IEnumerable<NewsSummaryModel>> GetNewsSummaryAsync(
            string? keyword, 
            string? status, 
            bool onlyPublished,
            int pageNumber, 
            int pageSize);
            
        Task<int> CountNewsSummaryAsync(string? keyword, string? status, bool onlyPublished);
    }
}
