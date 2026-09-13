using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Uitls
{
    public static class OrderStatus
    {
        public const string Pending = "Pending";       // Chờ xác nhận
        public const string Confirmed = "Confirmed";   // Đã xác nhận
        public const string Preparing = "Preparing";   // Đang pha chế
        public const string Delivering = "Delivering"; // Đang giao
        public const string Completed = "Completed";   // Hoàn thành
        public const string Cancelled = "Cancelled";   // Đã hủy
    }
}
