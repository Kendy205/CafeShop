using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CafeShop.Repositories.IRepository
{
    public interface IRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null,
            string? includeProperties = null,
            int? pageSize = null,
            int? pageNumber = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null);
        Task<T?> GetFirstOrDefaultAsync(Expression<Func<T, bool>>? filter = null, string? includeProperties = null);
        Task AddAsync(T entity);
        void Update(T entity);
        void Remove(T entity);
        Task<int> CountAsync(Expression<Func<T, bool>>? filter = null);
        void RemoveRange(IEnumerable<T> entity);
    }
}
