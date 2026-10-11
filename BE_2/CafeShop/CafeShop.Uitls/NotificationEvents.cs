namespace CafeShop.Uitls
{
    public static class NotificationEvents
    {
        public const string Admin = "ReceiveAdminNotification";
        public const string User = "ReceiveUserNotification";
        public const string AdminsGroup = "Admins";
        public static string UserGroup(int userId) => $"user_{userId}";
    }
}
