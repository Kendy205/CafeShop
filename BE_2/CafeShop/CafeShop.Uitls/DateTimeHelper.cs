using System;

namespace CafeShop.Uitls
{
    public static class DateTimeHelper
    {
        private static readonly TimeZoneInfo _vietnamTimeZone = GetVietnamTimeZone();

        private static TimeZoneInfo GetVietnamTimeZone()
        {
            try
            {
                // Windows timezone ID
                return TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            }
            catch
            {
                // Linux / macOS IANA timezone ID (khi deploy docker / cloud)
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
            }
        }

        /// <summary>
        /// Lấy thời gian hiện tại chuẩn múi giờ Việt Nam (GMT+7)
        /// </summary>
        public static DateTime VietnamNow => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _vietnamTimeZone);

        /// <summary>
        /// Chuyển đổi một thời điểm UTC sang giờ Việt Nam
        /// </summary>
        public static DateTime ToVietnamTime(DateTime utcDateTime)
        {
            DateTime utc = utcDateTime.Kind == DateTimeKind.Utc 
                ? utcDateTime 
                : DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);
            return TimeZoneInfo.ConvertTimeFromUtc(utc, _vietnamTimeZone);
        }
    }
}
