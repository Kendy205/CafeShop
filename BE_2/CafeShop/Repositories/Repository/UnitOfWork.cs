using System;
using System.Threading.Tasks;
using CoffeeShop.Models;
using CoffeeShop.Repositories.IRepository;

namespace CoffeeShop.Repositories.Repository
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public IUserRepository User { get; private set; }
        public IRoleRepository Role { get; private set; }
        public IAddressRepository Address { get; private set; }
        public ICategoryRepository Category { get; private set; }
        public IProductRepository Product { get; private set; }
        public ISizeRepository Size { get; private set; }
        public IToppingRepository Topping { get; private set; }
        public IVoucherRepository Voucher { get; private set; }
        public IOrderRepository Order { get; private set; }
        public IOrderDetailRepository OrderDetail { get; private set; }
        public IOrderDetailToppingRepository OrderDetailTopping { get; private set; }

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            User = new UserRepository(_context);
            Role = new RoleRepository(_context);
            Address = new AddressRepository(_context);
            Category = new CategoryRepository(_context);
            Product = new ProductRepository(_context);
            Size = new SizeRepository(_context);
            Topping = new ToppingRepository(_context);
            Voucher = new VoucherRepository(_context);
            Order = new OrderRepository(_context);
            OrderDetail = new OrderDetailRepository(_context);
            OrderDetailTopping = new OrderDetailToppingRepository(_context);
        }

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
