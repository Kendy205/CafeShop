using AutoMapper;
using CafeShop.DTO.Address;
using CafeShop.DTO.Auth;
using CafeShop.DTO.Cart;
using CafeShop.DTO.Feedback;
using CafeShop.DTO.Order;
using CafeShop.DTO.Product;
using CafeShop.DTO.Size;
using CafeShop.DTO.Topping;
using CafeShop.DTO.User;
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
            .ForMember(dest => dest.SizeName, opt => opt.MapFrom(src => src.Size != null ? src.Size.Name : ""))
            // Logic mới: Nếu Price có giá trị thì lấy Price, nếu null thì lấy BasePrice
            .ForMember(dest => dest.Price, opt => opt.MapFrom(src =>
                src.Price.HasValue ? src.Price.Value : (src.Product != null ? src.Product.BasePrice : 0)));
            CreateMap<CreateProductDto, Product>();

            // ==========================================
            // 2. USER
            // ==========================================
            CreateMap<User, UserResponseDto>();
            CreateMap<User, UserProfileDto>().ReverseMap();
            CreateMap<User, CafeShop.DTO.Admin.AdminUserDto>();

            // ==========================================
            // 4. ORDER
            // ==========================================
            CreateMap<Order, OrderResponseDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderDetails))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : ""))
                .ForMember(dest => dest.UserPhone, opt => opt.MapFrom(src => src.User != null ? src.User.PhoneNumber : ""))
                .ForMember(dest => dest.ShippingAddress, opt => opt.MapFrom(src => src.Address != null ? src.Address.FullAddress : ""));
            CreateMap<OrderDetail, OrderDetailDto>()
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : ""))
                // Ánh xạ ImageUrl từ Product sang
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Product != null ? src.Product.ImageUrl : ""))
                // Nếu SizeId lưu trong DB = 0 
                .ForMember(dest => dest.SizeId, opt => opt.MapFrom(src => src.SizeId == 0 ? (int?)null : src.SizeId))
                .ForMember(dest => dest.SizeName, opt => opt.MapFrom(src => src.Size != null ? src.Size.Name : null))
                .ForMember(dest => dest.Toppings, opt => opt.MapFrom(src => src.OrderDetailToppings))
                .ForMember(dest => dest.IsReviewed, opt => opt.MapFrom(src =>
                    src.Feedbacks != null && src.Feedbacks.Any(f => f.OrderDetailId == src.OrderDetailId)));
            CreateMap<OrderDetailTopping, OrderItemToppingDto>()
                .ForMember(dest => dest.ToppingId, opt => opt.MapFrom(src => src.ToppingId))
                .ForMember(dest => dest.ToppingName, opt => opt.MapFrom(src => src.Topping != null ? src.Topping.Name : ""))
                .ForMember(dest => dest.Unit, opt => opt.MapFrom(src => src.Topping != null ? src.Topping.Unit : ""))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Topping != null ? src.Topping.ImageUrl : ""))
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

            // ==========================================
            // 7. Feedback
            // ==========================================
            CreateMap<Feedback, FeedbackResponseDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src =>
                    src.User != null ? src.User.FullName : "Người dùng ẩn danh"));


        }
    }
}