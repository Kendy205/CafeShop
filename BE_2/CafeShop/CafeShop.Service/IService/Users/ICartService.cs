using CafeShop.DTO.Cart;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.IService
{
    public interface ICartService
    {
        Task<CartResponseDto> GetCartAsync(int userId);
        Task AddToCartAsync(int userId, AddToCartRequestDto request);
        Task UpdateQuantityAsync(int userId, int cartItemId, int quantity);
        Task RemoveItemAsync(int userId, int cartItemId);
        Task ClearCartAsync(int userId);
    }
}
