using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.UnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository User { get; }
        IProductSizeRepository ProductSize { get; }
        ICartItemToppingRepository CartItemTopping { get; }
        IAddressRepository Address { get; }
        ICategoryRepository Category { get; }
        IProductRepository Product { get; }
        ISizeRepository Size { get; }
        IToppingRepository Topping { get; }
        IVoucherRepository Voucher { get; }
        IOrderRepository Order { get; }
        IOrderDetailRepository OrderDetail { get; }
        IOrderDetailToppingRepository OrderDetailTopping { get; }
        ICartRepository Cart { get; }
        ICartItemRepository CartItem { get; }
        IUserVoucherRepository UserVoucher { get; }
        Task<int> SaveAsync();
        Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> BeginTransactionAsync();
    }
}
