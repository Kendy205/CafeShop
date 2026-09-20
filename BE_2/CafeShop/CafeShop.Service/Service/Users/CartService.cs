using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Cart;
using CafeShop.Model;
using CafeShop.Service.IService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CafeShop.Service.Service
{
    public class CartService : ICartService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CartService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<CartResponseDto> GetCartAsync(int userId)
        {
            var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(
                c => c.UserId == userId && c.Status == "active",
                includeProperties: "CartItems.Product.ProductSizes,CartItems.Size,CartItems.CartItemToppings.Topping");

            if (cart == null)
                throw new ArgumentException("Không tìm thấy giỏ hàng của người dùng!");

            var response = new CartResponseDto
            {
                CartId = cart.CartId,
                Status = cart.Status,
                Items = new List<CartItemResponseDto>()
            };

            decimal cartTotal = 0;

            if (cart.CartItems != null)
            {
                foreach (var item in cart.CartItems)
                {
                    var itemTotal = item.UnitPrice * item.Quantity;
                    cartTotal += itemTotal;

                    int currentStock = 0;
                    if (item.SizeId.HasValue && item.SizeId > 0 && item.Product?.ProductSizes != null)
                    {
                        var productSize = item.Product.ProductSizes.FirstOrDefault(ps => ps.SizeId == item.SizeId.Value);
                        currentStock = productSize != null ? productSize.StockQuantity : 0;
                    }
                    else if (item.Product != null)
                    {
                        currentStock = item.Product.StockQuantity;
                    }

                    response.Items.Add(new CartItemResponseDto
                    {
                        CartItemId = item.CartItemId,
                        ProductId = item.ProductId,
                        ProductName = item.Product?.Name ?? "Sản phẩm không xác định",
                        ImageUrl = item.Product?.ImageUrl,
                        SizeId = item.SizeId,
                        SizeName = item.Size?.Name,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalItemPrice = itemTotal,
                        StockQuantity = currentStock,
                        Toppings = item.CartItemToppings?.Select(t => new CartItemToppingDto
                        {
                            ToppingId = t.ToppingId,
                            Name = t.Topping?.Name ?? "Topping ẩn",
                            Price = t.UnitPrice,
                            Quantity = t.Quantity,
                            Unit = t.Topping?.Unit ?? "",
                            ImageUrl = t.Topping?.ImageUrl,
                            StockQuantity = t.Topping?.StockQuantity ?? 0
                        }).ToList() ?? new List<CartItemToppingDto>()
                    });
                }
            }

            response.TotalPrice = cartTotal;
            return response;
        }

        public async Task AddToCartAsync(int userId, AddToCartRequestDto request)
        {
            var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(c => c.UserId == userId && c.Status == "active", "CartItems.CartItemToppings");
            if (cart == null)
                throw new ArgumentException("Giỏ hàng không tồn tại!");

            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == request.ProductId);
            if (product == null)
                throw new ArgumentException("Sản phẩm không tồn tại!");

            // 1. Khởi tạo giá bằng BasePrice (Dùng cho món không có size)
            decimal unitPrice = product.BasePrice;

            // 2. Lấy giá cứng từ bảng ProductSize
            if (request.SizeId.HasValue && request.SizeId.Value > 0)
            {
                var productSize = await _unitOfWork.ProductSize.GetFirstOrDefaultAsync(
                    ps => ps.ProductId == request.ProductId && ps.SizeId == request.SizeId.Value);

                if (productSize == null)
                    throw new ArgumentException("Sản phẩm không hỗ trợ kích cỡ này!");

                // Nếu admin có set giá riêng cho Size này, thì lấy giá đó. 
                // Nếu không (Price == null) thì vẫn giữ BasePrice
                if (productSize.Price.HasValue)
                {
                    unitPrice = productSize.Price.Value;
                }
            }

            // 3. Lấy thông tin các Topping để cộng giá
            var toppingsToAdd = new List<CartItemTopping>();

            if (request.Toppings != null && request.Toppings.Any())
            {
                foreach (var topSelection in request.Toppings)
                {
                    var topping = await _unitOfWork.Topping.GetFirstOrDefaultAsync(t => t.ToppingId == topSelection.ToppingId);

                    if (topping != null && topping.IsAvailable)
                    {
                        decimal toppingTotalPrice = (decimal)(topping.Price ?? 0) * topSelection.Quantity;
                        unitPrice += toppingTotalPrice; // Giá Topping cộng thêm vào đơn giá ly

                        toppingsToAdd.Add(new CartItemTopping
                        {
                            ToppingId = topping.ToppingId,
                            Quantity = topSelection.Quantity,
                            UnitPrice = toppingTotalPrice
                        });
                    }
                }
            }

            // 4. Kiểm tra xem món này (cùng Size, cùng Topping) đã có trong giỏ chưa
            int quantity = request.Quantity > 0 ? request.Quantity : 1;
            CartItem? existingCartItem = null;

            if (cart.CartItems != null)
            {
                foreach (var ci in cart.CartItems)
                {
                    if (ci.ProductId == request.ProductId && ci.SizeId == request.SizeId)
                    {
                        var existingToppings = ci.CartItemToppings?.ToList() ?? new List<CartItemTopping>();
                        
                        if (existingToppings.Count == toppingsToAdd.Count)
                        {
                            bool isMatch = true;
                            foreach (var newTop in toppingsToAdd)
                            {
                                var matchTop = existingToppings.FirstOrDefault(t => t.ToppingId == newTop.ToppingId && t.Quantity == newTop.Quantity);
                                if (matchTop == null)
                                {
                                    isMatch = false;
                                    break;
                                }
                            }

                            if (isMatch)
                            {
                                existingCartItem = ci;
                                break;
                            }
                        }
                    }
                }
            }

            // Nếu đã có món y hệt -> Chỉ tăng số lượng
            if (existingCartItem != null)
            {
                existingCartItem.Quantity += quantity;
                _unitOfWork.CartItem.Update(existingCartItem);
                await _unitOfWork.SaveAsync();
            }
            else
            {
                // 5. Nếu chưa có -> Thêm CartItem mới
                var newCartItem = new CartItem
                {
                    CartId = cart.CartId,
                    ProductId = request.ProductId,
                    SizeId = request.SizeId,
                    Quantity = quantity,
                    UnitPrice = unitPrice
                };

                await _unitOfWork.CartItem.AddAsync(newCartItem);
                await _unitOfWork.SaveAsync();

                // 6. Lưu danh sách Topping (nếu có)
                if (toppingsToAdd.Any())
                {
                    foreach (var cartItemTopping in toppingsToAdd)
                    {
                        cartItemTopping.CartItemId = newCartItem.CartItemId;
                        await _unitOfWork.CartItemTopping.AddAsync(cartItemTopping);
                    }
                    await _unitOfWork.SaveAsync();
                }
            }
        }

        public async Task UpdateQuantityAsync(int userId, int cartItemId, int quantity)
        {
            var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(c => c.UserId == userId && c.Status == "active");
            if (cart == null) throw new ArgumentException("Giỏ hàng không hợp lệ!");

            var cartItem = await _unitOfWork.CartItem.GetFirstOrDefaultAsync(ci => ci.CartItemId == cartItemId && ci.CartId == cart.CartId);
            if (cartItem == null) throw new ArgumentException("Món hàng không tồn tại trong giỏ!");

            if (quantity <= 0)
            {
                _unitOfWork.CartItem.Remove(cartItem);
            }
            else
            {
                cartItem.Quantity = quantity;
                _unitOfWork.CartItem.Update(cartItem);
            }

            await _unitOfWork.SaveAsync();
        }

        public async Task RemoveItemAsync(int userId, int cartItemId)
        {
            var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(c => c.UserId == userId && c.Status == "active");
            if (cart == null) throw new ArgumentException("Giỏ hàng không hợp lệ!");

            var cartItem = await _unitOfWork.CartItem.GetFirstOrDefaultAsync(ci => ci.CartItemId == cartItemId && ci.CartId == cart.CartId);
            if (cartItem == null) throw new ArgumentException("Món hàng không tồn tại trong giỏ!");

            _unitOfWork.CartItem.Remove(cartItem);
            await _unitOfWork.SaveAsync();
        }

        public async Task ClearCartAsync(int userId)
        {
            var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(c => c.UserId == userId && c.Status == "active", "CartItems");
            if (cart != null && cart.CartItems.Any())
            {
                _unitOfWork.CartItem.RemoveRange(cart.CartItems);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}