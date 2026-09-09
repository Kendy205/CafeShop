using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.DTO.Size
{
    public class SizeDto
    {
        public int SizeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal PercentIncrease { get; set; }
    }

    public class CreateUpdateSizeDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal PercentIncrease { get; set; } = 0;
    }
}
