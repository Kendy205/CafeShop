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
    }

    public class CreateUpdateSizeDto
    {
        [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Tên kích thước không được để trống")]
        [System.ComponentModel.DataAnnotations.MaxLength(10, ErrorMessage = "Tên kích thước tối đa 10 ký tự")]
        public string Name { get; set; } = string.Empty;
    }
}
