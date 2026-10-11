using System;
using System.Collections.Generic;

namespace CafeShop.DTO.Order.Responses
{
    public class OrderResponseDto
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserPhone { get; set; }
        public int AddressId { get; set; }
        public string? ShippingAddress { get; set; }
        public double DistanceKm { get; set; }
        public decimal ShippingFee { get; set; }
        public DateTime OrderDate { get; set; }
        public string CurrentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = CafeShop.Uitls.PaymentStatusConstants.Unpaid;
        public string? PaymentUrl { get; set; }
        public string? Note { get; set; }
        public int? VoucherId { get; set; }
        public decimal SubTotal { get; set; }
        public decimal OrderDiscount { get; set; }
        public decimal ShippingDiscount { get; set; }
        public decimal TotalAmount { get; set; }

        public List<OrderDetailDto> Items { get; set; } = new();
    }
}
