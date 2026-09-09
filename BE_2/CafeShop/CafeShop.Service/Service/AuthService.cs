using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Auth;

using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using CafeShop.Services.IServices;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _config;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration config)
        {
            _unitOfWork = unitOfWork;
            _config = config;
        }

        public async Task<string> RegisterAsync(RegisterRequestDto dto)
        {
            var existingUser = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.Username == dto.Username);
            if (existingUser != null)
            {
                return "Tên đăng nhập đã tồn tại!";
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = passwordHash,
                FullName = dto.FullName,
                Role = "CUSTOMER",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            // TẠO LUÔN GIỎ HÀNG TRỐNG CHO KHÁCH HÀNG MỚI
            var newCart = new Cart
            {
                User = newUser, // Gán object newUser vào, EF Core sẽ tự động map ID
                Status = "active"
            };

            await _unitOfWork.User.AddAsync(newUser);
            await _unitOfWork.Cart.AddAsync(newCart); // Nhớ đảm bảo IUnitOfWork đã khai báo Cart nhé
            await _unitOfWork.SaveAsync();

            return "Đăng ký thành công!";
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            // Tìm theo Username, không cần Include bảng Role nữa
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Sai tên đăng nhập hoặc mật khẩu!");
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Sai tên đăng nhập hoặc mật khẩu!");
            }

            // Kiểm tra tài khoản có bị khóa không (dựa vào trường IsActive trong ảnh)
            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Tài khoản của bạn đã bị khóa!");
            }

            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();

            var response = new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };

            return response;
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(AuthResponseDto dto)
        {
            var principal = GetPrincipalFromExpiredToken(dto.AccessToken);
            if (principal == null)
            {
                throw new UnauthorizedAccessException("Access Token không hợp lệ!");
            }

            // Tìm user dựa trên Username được lưu trong Claims
            var username = principal.FindFirst(ClaimTypes.Name)?.Value;
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.Username == username);

            if (user == null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new UnauthorizedAccessException("Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
            }

            var newAccessToken = GenerateAccessToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();

            var response = new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            };

            return response;
        }

        // ==========================================
        // CÁC HÀM HELPER 
        // ==========================================

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private string GenerateAccessToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);

            // Lấy Role trực tiếp từ string, nếu rỗng thì mặc định là CUSTOMER
            var role = !string.IsNullOrEmpty(user.Role) ? user.Role : "CUSTOMER";

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, user.Username), // Đổi thành ClaimTypes.Name cho chuẩn Username
                    new Claim(ClaimTypes.Role, role)
                }),
                Expires = DateTime.UtcNow.AddMinutes(30),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _config["Jwt:Issuer"],
                ValidAudience = _config["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"])),
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Token không hợp lệ");
            }

            return principal;
        }
    }
}