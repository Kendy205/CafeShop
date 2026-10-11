using CafeShop.DTO.Payment.Responses;
using CafeShop.Model;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CafeShop.Service.IService
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(Order order, string ipAddress);
        Task<VnPayPaymentUrlResponseDto> CreatePaymentUrlAsync(int orderId, int userId, string ipAddress);
        Task<VnPayCallbackResultDto> ProcessReturnCallbackAsync(IQueryCollection query);
        Task<VnPayIpnResponseDto> ProcessIpnCallbackAsync(IQueryCollection query);
    }
}
