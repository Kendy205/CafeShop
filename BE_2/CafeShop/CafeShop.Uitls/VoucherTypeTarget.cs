using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Uitls
{
    public static class VoucherTypeTarget
    {
        public const string USER = "USER";
        public const string PUBLIC = "PUBLIC";

        public static bool IsUser(string? targetType) =>
            string.Equals(targetType, USER, StringComparison.OrdinalIgnoreCase)
            || string.Equals(targetType, "Personal", StringComparison.OrdinalIgnoreCase);

        public static bool IsPublic(string? targetType) =>
            string.Equals(targetType, PUBLIC, StringComparison.OrdinalIgnoreCase)
            || string.Equals(targetType, "Public", StringComparison.OrdinalIgnoreCase);
    }
}
