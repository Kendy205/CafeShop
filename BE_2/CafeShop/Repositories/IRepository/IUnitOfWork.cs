using System;
using System.Threading.Tasks;

namespace CoffeeShop.Repositories.IRepository
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository User { get; }
        IRoleRepository Role { get; }
        IAddressRepository Address { get; }
        ICategoryRepository Category { get; }
        IProductRepository Product { get; }
        ISizeRepository Size { get; }
        IToppingRepository Topping { get; }
        IVoucherRepository Voucher { get; }
        IOrderRepository Order { get; }
        IOrderDetailRepository OrderDetail { get; }
        IOrderDetailToppingRepository OrderDetailTopping { get; }

        Task<int> SaveAsync();
    }
}
