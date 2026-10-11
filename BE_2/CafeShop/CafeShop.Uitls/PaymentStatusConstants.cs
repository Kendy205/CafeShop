namespace CafeShop.Uitls
{
    public static class PaymentStatusConstants
    {
        // Trạng thái thanh toán của Order
        public const string Unpaid = "UNPAID";
        public const string Paid = "PAID";
        public const string Failed = "FAILED";
        public const string Refunded = "REFUNDED";

        // Trạng thái của bản ghi Payment
        public const string PaymentPending = "PENDING";
        public const string PaymentSuccess = "SUCCESS";
        public const string PaymentFailed = "FAILED";
        public const string PaymentRefunded = "REFUNDED";

        // Nhà cung cấp thanh toán
        public const string ProviderVNPay = "VNPAY";
        public const string ProviderMoMo = "MOMO";
    }
}
