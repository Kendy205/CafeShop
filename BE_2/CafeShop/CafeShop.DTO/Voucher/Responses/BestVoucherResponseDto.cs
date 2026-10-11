namespace CafeShop.DTO.Voucher.Responses
{
    public class BestVoucherResponseDto
    {
        public VoucherDto Voucher { get; set; } = null!;
        public decimal DiscountAmount { get; set; }
        public decimal FinalOrderAmount { get; set; }
        public decimal FinalShippingFee { get; set; }
        public decimal FinalTotal { get; set; }
    }
}
