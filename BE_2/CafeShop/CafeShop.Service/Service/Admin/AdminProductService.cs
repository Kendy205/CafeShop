using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Product.Requests;
using CafeShop.DTO.Product.Responses;
using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;
using CafeShop.DTO.Product.Requests;
using CafeShop.DTO.Product.Responses;
using CafeShop.DTO.User;
using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard.Requests;
using CafeShop.DTO.Dashboard.Responses;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService.Admin;
using System.Text.Json;
using CafeShop.Service.IService;

namespace CafeShop.Service.Service.Admin
{
    public class AdminProductService : IAdminProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;
        private readonly IRedisCacheService _redisCache;

        public AdminProductService(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService, IRedisCacheService redisCache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
            _redisCache = redisCache;
        }

        private async Task InvalidateProductCacheAsync(int? productId = null)
        {
            if (productId.HasValue)
            {
                await _redisCache.RemoveAsync($"cafeshop:products:id:{productId.Value}");
            }
            // Tự động vô hiệu hóa toàn bộ cache danh sách, bộ lọc và gợi ý liên quan bằng versioning O(1)
            await _redisCache.BumpVersionAsync("products:ver");
        }

        public async Task<PagedResult<ProductResponseDto>> GetAllAsync(string? keyword = null, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null, bool? isAvailable = null, bool? outOfStock = null, string? sortBy = null, int pageNumber = 1, int pageSize = 10)
        {
            var (products, totalCount) = await _unitOfWork.Product.GetAdminProductsWithPagingAsync(
                keyword, categoryId, minPrice, maxPrice, isAvailable, outOfStock, sortBy, pageNumber, pageSize,
                includeProperties: "Category,ProductSizes,ProductSizes.Size,ProductToppings,ProductToppings.Topping");

            var mappedData = _mapper.Map<IEnumerable<ProductResponseDto>>(products);

            return new PagedResult<ProductResponseDto>
            {
                Items = mappedData,
                Total = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ProductResponseDto?> GetByIdAsync(int id)
        {
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(
                p => p.ProductId == id && !p.IsDeleted,
                includeProperties: "Category,ProductSizes,ProductSizes.Size,ProductToppings,ProductToppings.Topping"
            );

            if (product == null)
                return null;

            return _mapper.Map<ProductResponseDto>(product);
        }

        public async Task<ProductResponseDto> CreateProductAsync(CreateUpdateProductDto request)
        {
            var sizes = new List<CreateProductSizeDto>();
            if (!string.IsNullOrEmpty(request.ProductSizesJson))
            {
                try
                {
                    sizes = JsonSerializer.Deserialize<List<CreateProductSizeDto>>(request.ProductSizesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<CreateProductSizeDto>();
                }
                catch (JsonException ex)
                {
                    throw new Exception($"Lỗi parse chuỗi ProductSizesJson: {ex.Message}");
                }
            }

            var product = new Product
            {
                Name = request.Name,
                BasePrice = request.BasePrice,
                CategoryId = request.CategoryId,
                Description = request.Description,
                IsAvailable = request.IsAvailable,
                StockQuantity = sizes.Any() ? sizes.Sum(s => s.StockQuantity) : request.StockQuantity
            };

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(request.ImageFile);
                if (uploadResult.Error != null)
                    throw new Exception($"Lỗi tải ảnh lên hệ thống: {uploadResult.Error.Message}");
                    
                product.ImageUrl = uploadResult.SecureUrl.AbsoluteUri;
                product.ImagePublicId = uploadResult.PublicId;
            }

            await _unitOfWork.Product.AddAsync(product);
            await _unitOfWork.SaveAsync();

            if (sizes.Any())
            {
                foreach (var s in sizes)
                {
                    var ps = new ProductSize
                    {
                        ProductId = product.ProductId,
                        SizeId = s.SizeId,
                        Price = s.Price,
                        StockQuantity = s.StockQuantity
                    };
                    await _unitOfWork.ProductSize.AddAsync(ps);
                }
                await _unitOfWork.SaveAsync();
            }

            if (!string.IsNullOrEmpty(request.ProductToppingsJson))
            {
                try
                {
                    var toppingIds = JsonSerializer.Deserialize<List<int>>(request.ProductToppingsJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (toppingIds != null)
                    {
                        foreach (var tId in toppingIds)
                        {
                            var pt = new ProductTopping
                            {
                                ProductId = product.ProductId,
                                ToppingId = tId
                            };
                            await _unitOfWork.ProductTopping.AddAsync(pt);
                        }
                        await _unitOfWork.SaveAsync();
                    }
                }
                catch (JsonException ex)
                {
                    throw new Exception($"Lỗi parse chuỗi ProductToppingsJson: {ex.Message}");
                }
            }

            var updatedProduct = await GetByIdAsync(product.ProductId);
            await InvalidateProductCacheAsync();
            return updatedProduct!;
        }

        public async Task<ProductResponseDto> UpdateProductAsync(int id, CreateUpdateProductDto request)
        {
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == id && !p.IsDeleted);
            if (product == null) throw new ArgumentException("Không tìm thấy sản phẩm!");

            var sizes = new List<CreateProductSizeDto>();
            if (!string.IsNullOrEmpty(request.ProductSizesJson))
            {
                try
                {
                    sizes = JsonSerializer.Deserialize<List<CreateProductSizeDto>>(request.ProductSizesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<CreateProductSizeDto>();
                }
                catch (JsonException ex)
                {
                    throw new Exception($"Lỗi parse chuỗi ProductSizesJson: {ex.Message}");
                }
            }

            product.Name = request.Name;
            product.BasePrice = request.BasePrice;
            product.CategoryId = request.CategoryId;
            product.Description = request.Description;
            product.IsAvailable = request.IsAvailable;
            product.StockQuantity = sizes.Any() ? sizes.Sum(s => s.StockQuantity) : request.StockQuantity;

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(request.ImageFile);
                if (uploadResult.Error != null)
                    throw new Exception($"Lỗi tải ảnh lên hệ thống: {uploadResult.Error.Message}");
                    
                if (!string.IsNullOrEmpty(product.ImagePublicId))
                {
                    await _photoService.DeletePhotoAsync(product.ImagePublicId);
                }

                product.ImageUrl = uploadResult.SecureUrl.AbsoluteUri;
                product.ImagePublicId = uploadResult.PublicId;
            }

            _unitOfWork.Product.Update(product);

            if (sizes.Any())
            {
                var existingSizes = await _unitOfWork.ProductSize.GetAllAsync(ps => ps.ProductId == id);
                        foreach (var es in existingSizes)
                        {
                            _unitOfWork.ProductSize.Remove(es);
                        }
                        
                foreach (var s in sizes)
                {
                            var ps = new ProductSize
                            {
                                ProductId = product.ProductId,
                                SizeId = s.SizeId,
                                Price = s.Price,
                                StockQuantity = s.StockQuantity
                            };
                            await _unitOfWork.ProductSize.AddAsync(ps);
                }
            }

            if (!string.IsNullOrEmpty(request.ProductToppingsJson))
            {
                try
                {
                    var toppingIds = JsonSerializer.Deserialize<List<int>>(request.ProductToppingsJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (toppingIds != null)
                    {
                        var existingToppings = await _unitOfWork.ProductTopping.GetAllAsync(pt => pt.ProductId == id);
                        foreach (var et in existingToppings)
                        {
                            _unitOfWork.ProductTopping.Remove(et);
                        }

                        foreach (var tId in toppingIds)
                        {
                            var pt = new ProductTopping
                            {
                                ProductId = product.ProductId,
                                ToppingId = tId
                            };
                            await _unitOfWork.ProductTopping.AddAsync(pt);
                        }
                    }
                }
                catch (JsonException ex)
                {
                    throw new Exception($"Lỗi parse chuỗi ProductToppingsJson: {ex.Message}");
                }
            }

            await _unitOfWork.SaveAsync();
            await InvalidateProductCacheAsync(product.ProductId);
            var updatedProduct = await GetByIdAsync(product.ProductId);
            return updatedProduct!;
        }

        public async Task ToggleAvailabilityAsync(int id)
        {
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == id && !p.IsDeleted);
            if (product == null) throw new ArgumentException("Không tìm thấy sản phẩm!");

            product.IsAvailable = !product.IsAvailable;
            _unitOfWork.Product.Update(product);
            await _unitOfWork.SaveAsync();
            await InvalidateProductCacheAsync(id);
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == id && !p.IsDeleted);
            if (product != null)
            {
                // Soft delete để không bị lỗi khóa ngoại (Foreign key) với các bảng như OrderItem
                product.IsAvailable = false;
                product.IsDeleted = true;
                _unitOfWork.Product.Update(product);
                await _unitOfWork.SaveAsync();
                await InvalidateProductCacheAsync(id);
            }
        }
    }
}
