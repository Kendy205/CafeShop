using CoffeeShop.Models;
using CoffeeShop.Repositories.IRepository;

namespace CoffeeShop.Repositories.Repository
{
    public class CategoryRepository : Repository<Category>, ICategoryRepository
    {
        public CategoryRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
