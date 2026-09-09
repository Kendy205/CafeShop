using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Model
{
    public class UserVoucher
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int VoucherId { get; set; }

        public int UsageLimitPerUser { get; set; } = 1; // User này được dùng mấy lần (thường là 1)
        public int UsedCount { get; set; } = 0;         // User này đã dùng mấy lần
        public bool IsUsed => UsedCount >= UsageLimitPerUser;

        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;

        public Voucher Voucher { get; set; } = null!;
    }
}
