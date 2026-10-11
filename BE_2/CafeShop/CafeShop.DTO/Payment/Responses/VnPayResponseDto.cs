namespace CafeShop.DTO.Payment.Responses
{
    public class VnPayPaymentUrlResponseDto
    {
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentUrl { get; set; } = string.Empty;
    }

    public class VnPayCallbackResultDto
    {
        public bool Success { get; set; }
        public int OrderId { get; set; }
        public string? TransactionNo { get; set; }
        public string? BankCode { get; set; }
        public decimal Amount { get; set; }
        public string? ResponseCode { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
