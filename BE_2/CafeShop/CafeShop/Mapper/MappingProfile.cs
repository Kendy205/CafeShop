using AutoMapper;
using CafeShop.DTO.Address;
using CafeShop.DTO.Auth;
using CafeShop.DTO.Cart;
using CafeShop.DTO.Order;
using CafeShop.DTO.Product;
using CafeShop.DTO.Size;
using CafeShop.DTO.Topping;
using CafeShop.DTO.Voucher;
using CafeShop.Model;

namespace CafeShop.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ==========================================
            // 1. PRODUCT & PRODUCT SIZE
            // ==========================================
            CreateMap<Product, ProductResponseDto>()
                .ForMember(dest => dest.ProductSizes, opt => opt.MapFrom(src => src.ProductSizes))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : ""));

            //Ánh xạ bảng trung gian ProductSize sang DTO
            CreateMap<ProductSize, ProductSizeDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Size != null ? src.Size.Name : ""))
                // Tính giá trị Price (Giá BasePrice + % tăng thêm của Size) cho Frontend hiển thị
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src =>
                    src.Product != null && src.Size != null
                    ? src.Product.BasePrice + (src.Product.BasePrice * (src.Size.PercentIncrease / 100m))
                    : 0));

            CreateMap<CreateProductDto, Product>();


            // ==========================================
            // 2. USER
            // ==========================================
            CreateMap<User, UserResponseDto>();


            // ==========================================
            // 3. CART
            // ==========================================
            CreateMap<CartItemTopping, CartItemToppingDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Topping.Name))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Topping.Price));

            CreateMap<CartItem, CartItemResponseDto>()
                .ForMember(dest => dest.Toppings, opt => opt.MapFrom(src => src.CartItemToppings));


            // ==========================================
            // 4. ORDER
            // ==========================================
            CreateMap<Order, OrderResponseDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderDetails));

            CreateMap<OrderDetail, OrderDetailDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.SizeName, opt => opt.MapFrom(src => src.Size != null ? src.Size.Name : null))
                .ForMember(dest => dest.Toppings, opt => opt.MapFrom(src => src.OrderDetailToppings));

            CreateMap<OrderDetailTopping, OrderItemToppingDto>()
                .ForMember(dest => dest.ToppingName, opt => opt.MapFrom(src => src.Topping != null ? src.Topping.Name : ""))
                .ForMember(dest => dest.Unit, opt => opt.MapFrom(src => src.Topping != null ? src.Topping.Unit : ""))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice));


            // ==========================================
            // 5. ADDRESS, SIZE, TOPPING
            // ==========================================
            CreateMap<Address, AddressResponseDto>();
            CreateMap<CreateAddressDto, Address>();
            CreateMap<UpdateAddressDto, Address>();

            CreateMap<Size, SizeDto>();
            CreateMap<CreateUpdateSizeDto, Size>();

            CreateMap<Topping, ToppingDto>();
            CreateMap<CreateUpdateToppingDto, Topping>();


            // ==========================================
            // 6. VOUCHER
            // ==========================================
            CreateMap<Voucher, VoucherDto>()
                .ForMember(dest => dest.TargetType, opt => opt.MapFrom(src => src.TargetType.ToString()))
                .ForMember(dest => dest.ApplyType, opt => opt.MapFrom(src => src.ApplyType.ToString()))
                .ForMember(dest => dest.DiscountType, opt => opt.MapFrom(src => src.DiscountType.ToString()));
        }
    }
}