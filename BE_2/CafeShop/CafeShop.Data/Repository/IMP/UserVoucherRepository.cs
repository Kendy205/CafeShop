using CafeShop.Data.Repository.IRepository;
using CafeShop.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Data.Repository.IMP
{
    public class UserVoucherRepository : Repository<UserVoucher>, IUserVoucherRepository
    {
        private readonly ApplicationDbContext _context;
        public UserVoucherRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
        public async Task<List<UserVoucher>> GetUserVouchersWithDetailsAsync(int userId)
        {
            return await _context.UserVouchers
                .Include(uv => uv.Voucher)
                .Where(uv => uv.UserId == userId)
                .OrderByDescending(uv => uv.AssignedDate)
                .ToListAsync();
        }

        public async Task<UserVoucher?> GetActiveUserVoucherAsync(int userId, int voucherId)
        {
            DateTime now = DateTime.UtcNow;
            return await _context.UserVouchers
                .Include(uv => uv.Voucher)
                .FirstOrDefaultAsync(uv =>
                    uv.UserId == userId &&
                    uv.VoucherId == voucherId &&
                    uv.UsedCount < uv.UsageLimitPerUser &&
                    uv.Voucher.IsActive &&
                    uv.Voucher.StartDate <= now &&
                    uv.Voucher.EndDate >= now
                );
        }
    }
}
