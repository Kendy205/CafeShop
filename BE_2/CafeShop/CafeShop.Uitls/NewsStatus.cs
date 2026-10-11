using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Uitls
{
    public static class NewsStatus
    {
        public const string Draft = "DRAFT";
        public const string Published = "PUBLISHED";
        public const string Archived = "ARCHIVED";
        public const string Scheduled = "SCHEDULED";
        public const string Deleted = "DELETED";

        public static string ToVietnamese(string status) => status switch
        {
            Draft => "Bản nháp",
            Published => "Đã xuất bản",
            Archived => "Đã lưu trữ",
            Scheduled => "Đã lên lịch",
            Deleted => "Đã xóa",
            _ => status
        };
    }
}
