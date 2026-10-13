using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Auth.Requests;
using CafeShop.DTO.Auth.Responses;
using CafeShop.Uitls;

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
using System.Collections.Generic;
using System.Linq;

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
            var username = dto.Username?.Trim();
            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentException("Tên đăng nhập không được để trống!");

            var existingUser = await _unitOfWork.User.GetFirstOrDefaultAsync(u => u.Username == username);
            if (existingUser != null)
                throw new ArgumentException("Tên đăng nhập đã tồn tại!");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var newUser = new User
            {
                Username = username,
                PasswordHash = passwordHash,
                FullName = dto.FullName,
                IsActive = true,
                CreatedAt = DateTimeHelper.VietnamNow
            };

            // TẠO LUÔN GIỎ HÀNG TRỐNG CHO KHÁCH HÀNG MỚI
            var newCart = new Cart
            {
                User = newUser,
                Status = CafeShop.Uitls.CartStatus.Active
            };

            await _unitOfWork.User.AddAsync(newUser);
            await _unitOfWork.Cart.AddAsync(newCart);
            await _unitOfWork.SaveAsync();

            // Tự động gán Role mặc định là USER sau khi tạo xong
            var defaultRole = await _unitOfWork.Role.GetFirstOrDefaultAsync(r => r.Name == CafeShop.Uitls.SystemRole.User);
            if (defaultRole != null)
            {
                var userRole = new UserRole { UserId = newUser.UserId, RoleId = defaultRole.RoleId };
                await _unitOfWork.UserRole.AddAsync(userRole);
                await _unitOfWork.SaveAsync();
            }

            return "Đăng ký thành công!";
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            // Lấy User và Include UserRoles, Role
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(
                u => u.Username == dto.Username, 
                includeProperties: "UserRoles,UserRoles.Role,UserRoles.Role.RolePermissions,UserRoles.Role.RolePermissions.Permission");
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
            user.RefreshTokenExpiryTime = DateTimeHelper.VietnamNow.AddDays(7);

            _unitOfWork.User.Update(user);
            await _unitOfWork.SaveAsync();

            var response = new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };

            return response;
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.RefreshToken))
            {
                throw new UnauthorizedAccessException("Refresh Token không hợp lệ!");
            }

            // Tìm user dựa trên RefreshToken
            var user = await _unitOfWork.User.GetFirstOrDefaultAsync(
                u => u.RefreshToken == dto.RefreshToken,
                includeProperties: "UserRoles,UserRoles.Role,UserRoles.Role.RolePermissions,UserRoles.Role.RolePermissions.Permission");

            if (user == null || user.RefreshTokenExpiryTime <= DateTimeHelper.VietnamNow)
            {
                throw new UnauthorizedAccessException("Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Tài khoản của bạn đã bị khóa!");
            }

            var newAccessToken = GenerateAccessToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTimeHelper.VietnamNow.AddDays(7);
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

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username) 
            };

            bool hasRoles = false;
            if (user.UserRoles != null && user.UserRoles.Any())
            {
                foreach (var userRole in user.UserRoles)
                {
                    if (userRole.Role != null && !string.IsNullOrEmpty(userRole.Role.Name))
                    {
                        claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Name));
                        hasRoles = true;

                        // Thêm Permission Claims
                        if (userRole.Role.RolePermissions != null)
                        {
                            foreach (var rp in userRole.Role.RolePermissions)
                            {
                                if (rp.Permission != null && !string.IsNullOrEmpty(rp.Permission.Code))
                                {
                                    // Tránh trùng lặp quyền nếu 1 User có nhiều Role cùng sở hữu 1 Permission
                                    if (!claims.Any(c => c.Type == "Permission" && c.Value == rp.Permission.Code))
                                    {
                                        claims.Add(new Claim("Permission", rp.Permission.Code));
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Fallback: Mặc định là User nếu chưa có quyền
            if (!hasRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, CafeShop.Uitls.SystemRole.User));
            }
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(3),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

    }
}