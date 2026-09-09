using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Topping
{
    public class ToppingDto
    {
        public int ToppingId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Unit { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public int StockQuantity { get; set; } = 0;
        public string? ImageUrl { get; set; }
    }

    public class CreateUpdateToppingDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Unit { get; set; } = string.Empty; // ml, gram, phần...
        public bool IsAvailable { get; set; } = true;

        public int StockQuantity { get; set; } = 0;
        public string? ImageUrl { get; set; }
    }
}
