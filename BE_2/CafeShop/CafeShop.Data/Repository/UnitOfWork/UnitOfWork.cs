using CafeShop.Data.Repository.IMP;
using CafeShop.Data.Repository.IRepository;
using CafeShop.Repositories.IRepository;
using CafeShop.Repositories.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        public ICartItemToppingRepository CartItemTopping { get; private set; }
        public IUserRepository User { get; private set; }
        public ICartRepository Cart { get; private set; }
        public ICartItemRepository CartItem { get; private set; }
        //public IRoleRepository Role { get; private set; }
        public IAddressRepository Address { get; private set; }
        public ICategoryRepository Category { get; private set; }
        public IProductRepository Product { get; private set; }
        public ISizeRepository Size { get; private set; }
        public IToppingRepository Topping { get; private set; }
        public IVoucherRepository Voucher { get; private set; }
        public IOrderRepository Order { get; private set; }
        public IOrderDetailRepository OrderDetail { get; private set; }
        public IOrderDetailToppingRepository OrderDetailTopping { get; private set; }

        public IProductSizeRepository ProductSize { get; private set; }
        public IUserVoucherRepository UserVoucher { get; private set; }

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            User = new UserRepository(_context);
            // Role = new RoleRepository(_context);
            Address = new AddressRepository(_context);
            Category = new CategoryRepository(_context);
            Product = new ProductRepository(_context);
            Size = new SizeRepository(_context);
            Topping = new ToppingRepository(_context);
            Voucher = new VoucherRepository(_context);
            Order = new OrderRepository(_context);
            OrderDetail = new OrderDetailRepository(_context);
            OrderDetailTopping = new OrderDetailToppingRepository(_context);
            Cart = new CartRepository(_context);
            CartItem = new CartItemRepository(_context);
            CartItemTopping = new CartItemToppingRepository(_context);
            ProductSize = new ProductSizeRepository(_context);
            UserVoucher = new UserVoucherRepository(_context);
        }

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public async Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
