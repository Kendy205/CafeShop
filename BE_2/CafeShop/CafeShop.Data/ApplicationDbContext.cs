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
        public DbSet<ProductTopping> ProductToppings { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderDetailTopping> OrderDetailToppings { get; set; }
        public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<UserVoucher> UserVouchers { get; set; }
        public DbSet<ShippingConfig> ShippingConfigs { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            base.ConfigureConventions(configurationBuilder);
            
            // Lỗi 10: Cấu hình mặc định decimal(18,0) cho toàn bộ tiền tệ VNĐ
            configurationBuilder.Properties<decimal>().HavePrecision(18, 0);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Lỗi 7: Thêm Unique Index cho Username, Email, Code
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<Voucher>().HasIndex(v => v.Code).IsUnique();

            // Bắt buộc khai báo Khóa chính kép cho bảng trung gian
            modelBuilder.Entity<ProductSize>()
                .HasKey(ps => new { ps.ProductId, ps.SizeId });
            modelBuilder.Entity<ProductTopping>()
                .HasKey(pt => new { pt.ProductId, pt.ToppingId });
            // Ngăn lỗi Cascade Delete khi cấu hình khóa ngoại cho Feedback
            modelBuilder.Entity<Feedback>()
                .HasOne(f => f.OrderDetail)
                .WithMany(o => o.Feedbacks)
                .HasForeignKey(f => f.OrderDetailId)
                .OnDelete(DeleteBehavior.Restrict); // Hoặc DeleteBehavior.NoAction
                
            // Ngăn lỗi Cascade Delete khi cấu hình khóa ngoại Product cho OrderDetail
            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Product)
                .WithMany()
                .HasForeignKey(od => od.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            // Cấu hình RBAC
            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name)
                .IsUnique();

            modelBuilder.Entity<Permission>()
                .HasIndex(p => p.Code)
                .IsUnique();

            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });

            // Cấu hình News
            modelBuilder.Entity<News>()
                .HasIndex(n => n.Slug)
                .IsUnique();
            modelBuilder.Entity<News>()
                .HasIndex(n => n.Status);
            modelBuilder.Entity<News>()
                .HasIndex(n => n.PublishedAt);

            modelBuilder.Entity<News>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
