using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.IService
{
    public interface IShippingService
    {
        Task<decimal> CalculateFeeAsync(double distanceKm)
    }
}
