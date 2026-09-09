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
            //Product
            CreateMap<Product, ProductResponseDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category!.Name));
            CreateMap<CreateProductDto, Product>();
            //User
            CreateMap<User, UserResponseDto>();
            //Cart
            CreateMap<CartItemTopping, CartItemToppingDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Topping.Name))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Topping.Price));
            CreateMap<CartItem, CartItemResponseDto>()
                // ... các cấu hình cũ
                .ForMember(dest => dest.Toppings, opt => opt.MapFrom(src => src.CartItemToppings));
            //MyOrder
            CreateMap<Order, OrderResponseDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderDetails));
            CreateMap<OrderDetail, OrderDetailDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.SizeName, opt => opt.MapFrom(src => src.Size != null ? src.Size.Name : null))
                .ForMember(dest => dest.Toppings, opt => opt.MapFrom(src => src.OrderDetailToppings));
            CreateMap<OrderDetailTopping, OrderItemToppingDto>()
                .ForMember(dest => dest.ToppingName, opt => opt.MapFrom(src => src.Topping != null ? src.Topping.Name : ""))
                .ForMember(dest => dest.Unit, opt => opt.MapFrom(src => src.Topping != null ? src.Topping.Unit : "")) // Lấy Unit từ bảng gốc
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice));
            //Address

            CreateMap<Address, AddressResponseDto>();
            CreateMap<CreateAddressDto, Address>();
            CreateMap<UpdateAddressDto, Address>();
            //Size Topping
            CreateMap<Size, SizeDto>();
            CreateMap<CreateUpdateSizeDto, Size>();

            CreateMap<Topping, ToppingDto>();
            CreateMap<CreateUpdateToppingDto, Topping>();
            //Voucher
            CreateMap<Voucher, VoucherDto>()
    .ForMember(dest => dest.TargetType, opt => opt.MapFrom(src => src.TargetType.ToString()))
    .ForMember(dest => dest.ApplyType, opt => opt.MapFrom(src => src.ApplyType.ToString()))
    .ForMember(dest => dest.DiscountType, opt => opt.MapFrom(src => src.DiscountType.ToString()));
        }
    }
}
