using CafeShop.DTO.Auth.Requests;
using CafeShop.DTO.Auth.Responses;
using CafeShop.Service.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.IService
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<string> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> RefreshTokenAsync(AuthResponseDto request);
    }
}
