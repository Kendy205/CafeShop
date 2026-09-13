using CafeShop.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItemTopping> CartItemToppings { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Size> Sizes { get; set; }
        public DbSet<ProductSize> ProductSizes { get; set; }
        public DbSet<Topping> Toppings { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderDetailTopping> OrderDetailToppings { get; set; }
        public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<UserVoucher> UserVouchers { get; set; }
        public DbSet<ShippingConfig> ShippingConfigs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Bắt buộc khai báo Khóa chính kép cho bảng trung gian
            modelBuilder.Entity<ProductSize>()
                .HasKey(ps => new { ps.ProductId, ps.SizeId });
            // Ngăn lỗi Cascade Delete khi cấu hình khóa ngoại cho Feedback
            modelBuilder.Entity<Feedback>()
                .HasOne(f => f.OrderDetail)
                .WithMany(o => o.Feedbacks)
                .HasForeignKey(f => f.OrderDetailId)
                .OnDelete(DeleteBehavior.Restrict); // Hoặc DeleteBehavior.NoAction
        }
    }
}
