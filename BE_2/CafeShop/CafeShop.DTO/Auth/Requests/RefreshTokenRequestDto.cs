using System.ComponentModel.DataAnnotations;

namespace CafeShop.DTO.Auth.Requests
{
    public class RefreshTokenRequestDto
    {
        public string? AccessToken { get; set; }

        [Required(ErrorMessage = "RefreshToken không được để trống")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
