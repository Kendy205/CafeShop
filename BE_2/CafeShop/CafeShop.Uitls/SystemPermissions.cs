namespace CafeShop.Uitls
{
    public static class SystemPermissions
    {
        // ORDER
        public const string OrderView = "ORDER_VIEW";
        public const string OrderUpdateStatus = "ORDER_UPDATE_STATUS";

        // PRODUCT & CATALOG
        public const string ProductView = "PRODUCT_VIEW";
        public const string ProductCreate = "PRODUCT_CREATE";
        public const string ProductEdit = "PRODUCT_EDIT";
        public const string ProductDelete = "PRODUCT_DELETE";

        // USER
        public const string UserView = "USER_VIEW";
        public const string UserToggle = "USER_TOGGLE";

        // NEWS
        public const string NewsCreate = "NEWS_CREATE";
        public const string NewsEdit = "NEWS_EDIT";

        // FEEDBACK
        public const string FeedbackModerate = "FEEDBACK_MODERATE";

        // VOUCHER
        public const string VoucherManage = "VOUCHER_MANAGE";

        // RBAC
        public const string RoleManage = "ROLE_MANAGE";

        // SHIPPING
        public const string ShippingManage = "SHIPPING_MANAGE";
    }
}
