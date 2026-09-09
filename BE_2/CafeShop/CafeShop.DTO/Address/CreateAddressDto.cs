using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace CafeShop.DTO.Address
{
    public class CreateAddressDto
    {
        public string RecipientName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // Nhận chuỗi thẳng từ Mapbox truyền lên
        public string FullAddress { get; set; } = string.Empty;

        public bool IsDefault { get; set; } = false;
    }

    public class UpdateAddressDto : CreateAddressDto
    {
    }

    public class AddressResponseDto
    {
        public int AddressId { get; set; }
        public string RecipientName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string FullAddress { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
