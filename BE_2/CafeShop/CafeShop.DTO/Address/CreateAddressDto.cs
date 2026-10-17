using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace CafeShop.DTO.Address
{
    public class CreateAddressDto
    {
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Tên người nhận không được để trống")]
        [System.ComponentModel.DataAnnotations.MaxLength(150, ErrorMessage = "Tên người nhận tối đa 150 ký tự")]
        public string RecipientName { get; set; } = string.Empty;

        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Số điện thoại không được để trống")]
        [System.ComponentModel.DataAnnotations.Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [System.ComponentModel.DataAnnotations.MaxLength(20, ErrorMessage = "Số điện thoại tối đa 20 ký tự")]
        public string Phone { get; set; } = string.Empty;

        // Nhận chuỗi thẳng từ Mapbox truyền lên
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Địa chỉ chi tiết không được để trống")]
        [System.ComponentModel.DataAnnotations.MaxLength(500, ErrorMessage = "Địa chỉ tối đa 500 ký tự")]
        public string FullAddress { get; set; } = string.Empty;

        public bool IsDefault { get; set; } = false;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

}
