using System.Collections.Generic;
using CafeShop.DTO.Order.Requests;

namespace CafeShop.DTO.Voucher.Requests
{
    public class BestVoucherRequestDto
    {
        public bool IsBuyNow { get; set; }
        public double DistanceKm { get; set; }
        public List<CreateOrderDetailDto>? Items { get; set; }
    }
}
