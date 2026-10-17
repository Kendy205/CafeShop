namespace CafeShop.Uitls
{
    public static class NotificationEvents
    {
        public const string Admin = "ReceiveAdminNotification";
        public const string User = "ReceiveUserNotification";
        public const string OrderNotification = "ReceiveOrderNotification";

        public const string AdminsGroup = "Admins";
        public const string OrderManagementGroup = "OrderManagement";
        public static string UserGroup(int userId) => $"user_{userId}";
    }

    public static class NotificationTypes
    {
        public const string NewOrder = "NewOrder";
        public const string OrderCancelled = "OrderCancelled";
        public const string PaymentSuccess = "PaymentSuccess";
        public const string OrderStatusChanged = "OrderStatusChanged";
    }
}
