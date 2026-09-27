using CafeShop.Data;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using CafeShop.Service.IService.Users;
using CafeShop.Service.IService.Notifications;
using CafeShop.Hubs;

using CafeShop.Service.Service;
using CafeShop.Service.Service.Users;
using CafeShop.Services.IServices;
using CafeShop.Services.Services;
using CafeShop.Service.IService.Admin;
using CafeShop.Service.Service.Admin;
using CafeShop.Realtime;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;


var builder = WebApplication.CreateBuilder(args);
//MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
//Mapper
builder.Services.AddAutoMapper(config =>
{
    config.AddMaps(typeof(Program).Assembly);
});
// Repository
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
//User Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICartService, CartService>();
//builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ISizeService, SizeService>();
builder.Services.AddScoped<IToppingService, ToppingService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IOrderDetailService, OrderDetailService>();
//builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IUserVoucherService, UserVoucherService>();
builder.Services.AddScoped<IOrderDetailToppingService, OrderDetailToppingService>();

// Admin Services
builder.Services.AddScoped<IAdminCategoryService, AdminCategoryService>();
builder.Services.AddScoped<IAdminProductService, AdminProductService>();
builder.Services.AddScoped<IAdminSizeService, AdminSizeService>();
builder.Services.AddScoped<IAdminToppingService, AdminToppingService>();
builder.Services.AddScoped<IAdminShippingConfigService, AdminShippingConfigService>();
builder.Services.AddScoped<IAdminOrderService, AdminOrderService>();
builder.Services.AddScoped<IAdminVoucherService, AdminVoucherService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();
builder.Services.AddScoped<IAdminNewsService, AdminNewsService>();
//public Services
builder.Services.AddScoped<IPhotoService, PhotoService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IShippingService, ShippingService>();
builder.Services.AddScoped<ISignalRService, SignalRService>();
builder.Services.AddScoped<INewsService, NewsService>();
// CẤU HÌNH CORS 
builder.Services.AddCors(o => o.AddPolicy("FE", p => p
    .WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5174")
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));
//CẤU HÌNH JWT BẢO MẬT API 
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
    
    // Cấu hình đọc token từ query string cho SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notification"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});
// CẤU HÌNH CLOUDINARY CHO LƯU TRỮ ẢNH
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Bỏ qua vòng lặp vô tận khi parse JSON
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FE");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notification");

app.Run();
