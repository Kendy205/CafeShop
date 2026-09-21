using System.Collections.Generic;

namespace CafeShop.DTO.Product
{
    public class SearchSuggestionDto
    {
        public IEnumerable<ProductResponseDto> TopSellingProducts { get; set; } = new List<ProductResponseDto>();
        public IEnumerable<ProductResponseDto> NewestProducts { get; set; } = new List<ProductResponseDto>();
    }
}
