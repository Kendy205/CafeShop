using System;

namespace CafeShop.DTO.Order.Responses
{
    public class OrderStatusHistoryDto
    {
        public int HistoryId { get; set; }
        public int OrderId { get; set; }
        public string Status { get; set; } = string.Empty;
        public int ChangedBy { get; set; }
        public string? ChangedByName { get; set; }
        public DateTime ChangedAt { get; set; }
        public string? Note { get; set; }
    }
}
