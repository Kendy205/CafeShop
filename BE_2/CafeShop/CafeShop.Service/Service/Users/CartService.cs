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
            // Lấy giỏ hàng kèm theo Product, Size và Toppings
            var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(
                c => c.UserId == userId && c.Status == "active",
                includeProperties: "CartItems.Product,CartItems.Size,CartItems.CartItemToppings.Topping");

            if (cart == null)
                throw new ArgumentException("Không tìm thấy giỏ hàng của người dùng!");

            // KHỞI TẠO DANH SÁCH: Tránh lỗi NullReferenceException khi dùng .Add()
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
                    // Tính giá gốc tại thời điểm thêm vào giỏ (bao gồm Product + Size + Toppings)
                    var itemTotal = item.UnitPrice * item.Quantity;
                    cartTotal += itemTotal;

                    response.Items.Add(new CartItemResponseDto
                    {
                        CartItemId = item.CartItemId,
                        ProductName = item.Product?.Name ?? "Sản phẩm không xác định",
                        SizeName = item.Size?.Name, // Trả về null nếu món không có Size
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalItemPrice = itemTotal,

                        // SỬ DỤNG .Toppings (số nhiều) & THÊM DẤU ? ĐỂ CHỐNG LỖI NULL
                        Toppings = item.CartItemToppings?.Select(t => new CartItemToppingDto
                        {
                            Name = t.Topping?.Name ?? "Topping ẩn",
                            Price = t.UnitPrice,
                            Quantity = t.Quantity,
                            Unit = t.Topping?.Unit ?? "",
                            ImageUrl = t.Topping?.ImageUrl
                        }).ToList() ?? new List<CartItemToppingDto>() // Nếu không có topping thì trả về mảng rỗng []
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

            // 1. Tính toán Đơn giá (UnitPrice) cho 1 ly nước này
            decimal unitPrice = product.BasePrice; // Giá gốc của sản phẩm

            // 2. LOGIC MỚI: Tính giá Size theo phần trăm
            if (request.SizeId.HasValue)
            {
                var sizeInfo = await _unitOfWork.Size.GetFirstOrDefaultAsync(s => s.SizeId == request.SizeId.Value);
                if (sizeInfo != null && sizeInfo.PercentIncrease > 0)
                {
                    decimal sizeSurcharge = product.BasePrice * (sizeInfo.PercentIncrease / 100m);
                    unitPrice = product.BasePrice + sizeSurcharge;
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
                        unitPrice += toppingTotalPrice;

                        toppingsToAdd.Add(new CartItemTopping
                        {
                            ToppingId = topping.ToppingId,
                            Quantity = topSelection.Quantity,
                            UnitPrice = toppingTotalPrice
                        });
                    }
                }
            }
            // 4. Thêm CartItem mới vào giỏ hàng
            int quantity = request.Quantity > 0 ? request.Quantity : 1;

            var newCartItem = new CartItem
            {
                CartId = cart.CartId,
                ProductId = request.ProductId,
                SizeId = request.SizeId,
                Quantity = quantity,
                UnitPrice = unitPrice
                // TotalPrice = unitPrice * quantity // Mở comment dòng này ra nếu DB của bạn có cột TotalPrice ở bảng CartItem
            };

            await _unitOfWork.CartItem.AddAsync(newCartItem);
            await _unitOfWork.SaveAsync(); // Lưu để EF Core sinh ra newCartItem.CartItemId

            // 5. Lưu danh sách Topping (nếu có) vào bảng trung gian
            if (toppingsToAdd.Any())
            {
                foreach (var cartItemTopping in toppingsToAdd)
                {
                    cartItemTopping.CartItemId = newCartItem.CartItemId;
                    await _unitOfWork.CartItemTopping.AddAsync(cartItemTopping);
                }
                await _unitOfWork.SaveAsync();
            }

            // (Tùy chọn) 6. Cập nhật lại tổng tiền của bảng Cart chính
            // cart.TotalAmount += (unitPrice * quantity);
            // _unitOfWork.Cart.Update(cart);
            // await _unitOfWork.SaveAsync();
        }

        public async Task UpdateQuantityAsync(int userId, int cartItemId, int quantity)
        {
            var cart = await _unitOfWork.Cart.GetFirstOrDefaultAsync(c => c.UserId == userId && c.Status == "active");
            if (cart == null) throw new ArgumentException("Giỏ hàng không hợp lệ!");

            var cartItem = await _unitOfWork.CartItem.GetFirstOrDefaultAsync(ci => ci.CartItemId == cartItemId && ci.CartId == cart.CartId);
            if (cartItem == null) throw new ArgumentException("Món hàng không tồn tại trong giỏ!");

            if (quantity <= 0)
            {
                _unitOfWork.CartItem.Remove(cartItem); // Xóa luôn nếu số lượng tụt về 0
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

            // Chú ý: Vì có khóa ngoại cascade, xóa CartItem sẽ tự động xóa các CartItemTopping liên quan
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
