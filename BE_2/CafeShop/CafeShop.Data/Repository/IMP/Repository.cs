
using CafeShop.Repositories.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IMP
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _context;
        internal DbSet<T> dbSet;

        public Repository(ApplicationDbContext context)
        {
            _context = context;
            this.dbSet = _context.Set<T>();
        }

        public async Task AddAsync(T entity) { await dbSet.AddAsync(entity); }

        public IQueryable<T> GetQueryable()
        {
            return dbSet.AsQueryable();
        }

        public Task<int> CountAsync(Expression<Func<T, bool>>? filter = null)
        {
            IQueryable<T> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);
            }
            return query.CountAsync();
        }

        public async Task<IEnumerable<T>> GetAllAsync(
            Expression<Func<T, bool>>? filter = null,
            string? includeProperties = null,
            int? pageSize = null,
            int? pageNumber = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null)
        {
            return await BuildQuery(dbSet.AsQueryable(), filter, includeProperties, pageSize, pageNumber, orderBy);
        }

        public async Task<IEnumerable<T>> GetAllAsNoTrackingAsync(
            Expression<Func<T, bool>>? filter = null,
            string? includeProperties = null,
            int? pageSize = null,
            int? pageNumber = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null)
        {
            return await BuildQuery(dbSet.AsNoTracking(), filter, includeProperties, pageSize, pageNumber, orderBy);
        }

        public async Task<T?> GetFirstOrDefaultAsync(Expression<Func<T, bool>>? filter = null, string? includeProperties = null)
        {
            return await BuildSingleQuery(dbSet.AsQueryable(), filter, includeProperties);
        }

        public async Task<T?> GetFirstOrDefaultAsNoTrackingAsync(Expression<Func<T, bool>>? filter = null, string? includeProperties = null)
        {
            return await BuildSingleQuery(dbSet.AsNoTracking(), filter, includeProperties);
        }

        private async Task<IEnumerable<T>> BuildQuery(
            IQueryable<T> query,
            Expression<Func<T, bool>>? filter,
            string? includeProperties,
            int? pageSize, int? pageNumber,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy)
        {
            if (filter != null) query = query.Where(filter);

            if (!string.IsNullOrWhiteSpace(includeProperties))
                foreach (var prop in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    query = query.Include(prop.Trim());

            if (orderBy != null) query = orderBy(query);

            if (pageSize.HasValue && pageNumber.HasValue)
                query = query.Skip((pageNumber.Value - 1) * pageSize.Value).Take(pageSize.Value);

            return await query.ToListAsync();
        }

        private async Task<T?> BuildSingleQuery(
            IQueryable<T> query,
            Expression<Func<T, bool>>? filter,
            string? includeProperties)
        {
            if (filter != null) query = query.Where(filter);

            if (!string.IsNullOrWhiteSpace(includeProperties))
                foreach (var prop in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
                    query = query.Include(prop.Trim());

            return await query.FirstOrDefaultAsync();
        }

        public void Remove(T entity) { dbSet.Remove(entity); }
        public void RemoveRange(IEnumerable<T> entities) { dbSet.RemoveRange(entities); }
        public void Update(T entity) { dbSet.Update(entity); }
    }
}
