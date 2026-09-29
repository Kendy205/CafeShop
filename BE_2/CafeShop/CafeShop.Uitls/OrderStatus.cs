using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Uitls
{
    public static class OrderStatus
    {
        public const string Pending = "PENDING";       // Chờ xác nhận
        public const string Confirmed = "CONFIRMED";   // Đã xác nhận
        public const string Preparing = "PREPARING";   // Đang pha chế
        public const string Delivering = "DELIVERING"; // Đang giao
        public const string Completed = "COMPLETED";   // Hoàn thành
        public const string Cancelled = "CANCELLED";   // Đã hủy

        public static string ToVietnamese(string status) => status switch
        {
            Pending => "Chờ xác nhận",
            Confirmed => "Đã xác nhận",
            Preparing => "Đang chuẩn bị",
            Delivering => "Đang giao hàng",
            Completed => "Hoàn thành",
            Cancelled => "Đã hủy",
            _ => status
        };

        // Danh sách trạng thái được phép chuyển đổi (State Machine)
        public static readonly Dictionary<string, List<string>> AllowedTransitions = new()
        {
            { Pending, new List<string> { Confirmed, Cancelled } },
            { Confirmed, new List<string> { Preparing, Cancelled } },
            { Preparing, new List<string> { Delivering, Cancelled } },
            { Delivering, new List<string> { Completed } }, // Không cho phép hủy khi đang giao hàng
            { Completed, new List<string>() }, // Trạng thái cuối, không thể chuyển đổi
            { Cancelled, new List<string>() }  // Trạng thái cuối, không thể chuyển đổi
        };

        public static bool IsValidTransition(string currentStatus, string newStatus)
        {
            if (AllowedTransitions.TryGetValue(currentStatus, out var allowedNextStates))
            {
                return allowedNextStates.Contains(newStatus);
            }
            return false;
        }
    }
}
