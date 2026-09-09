using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CoffeeShop.Repositories.IRepository;
using CoffeeShop.Models;

namespace CoffeeShop.Repositories.Repository
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
        public async Task<IEnumerable<T>> GetAllAsync() { return await dbSet.ToListAsync(); }
        public async Task<T> GetByIdAsync(object id) { return await dbSet.FindAsync(id); }
        public void Remove(T entity) { dbSet.Remove(entity); }
        public void Update(T entity) { dbSet.Update(entity); }
    }
}
