using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Product;
using CafeShop.DTO.Admin;
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

        public AdminProductService(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
        }

        public async Task<PagedResult<ProductResponseDto>> GetAllAsync(string? keyword = null, int? categoryId = null, decimal? minPrice = null, decimal? maxPrice = null, string? sortBy = null, int pageNumber = 1, int pageSize = 10)
        {
            var products = await _unitOfWork.Product.GetAllAsync(
                            includeProperties: "Category,ProductSizes,ProductSizes.Size");
            var query = products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(p => p.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase));
            }

            if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }

            if (minPrice.HasValue)
                query = query.Where(p => p.BasePrice >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.BasePrice <= maxPrice.Value);

            query = sortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.BasePrice),
                "price_desc" => query.OrderByDescending(p => p.BasePrice),
                "name_asc" => query.OrderBy(p => p.Name),
                _ => query.OrderByDescending(p => p.ProductId) 
            };

            int totalRecords = query.Count();

            var pagedData = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var mappedData = _mapper.Map<IEnumerable<ProductResponseDto>>(pagedData);

            return new PagedResult<ProductResponseDto>
            {
                Items = mappedData,
                Total = totalRecords,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<ProductResponseDto?> GetByIdAsync(int id)
        {
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(
                p => p.ProductId == id,
                includeProperties: "Category,ProductSizes,ProductSizes.Size"
            );

            if (product == null)
                return null;

            return _mapper.Map<ProductResponseDto>(product);
        }

        public async Task<ProductResponseDto> CreateProductAsync(CreateUpdateProductDto request)
        {
            var product = new Product
            {
                Name = request.Name,
                BasePrice = request.BasePrice,
                CategoryId = request.CategoryId,
                Description = request.Description,
                IsAvailable = request.IsAvailable,
                StockQuantity = request.StockQuantity
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

            if (!string.IsNullOrEmpty(request.ProductSizesJson))
            {
                try
                {
                    var sizes = JsonSerializer.Deserialize<List<CreateProductSizeDto>>(request.ProductSizesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (sizes != null)
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
                }
                catch (JsonException ex)
                {
                    throw new Exception($"Lỗi parse chuỗi ProductSizesJson: {ex.Message}");
                }
            }

            var updatedProduct = await GetByIdAsync(product.ProductId);
            return updatedProduct!;
        }

        public async Task<ProductResponseDto> UpdateProductAsync(int id, CreateUpdateProductDto request)
        {
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == id);
            if (product == null) throw new ArgumentException("Không tìm thấy sản phẩm!");

            product.Name = request.Name;
            product.BasePrice = request.BasePrice;
            product.CategoryId = request.CategoryId;
            product.Description = request.Description;
            product.IsAvailable = request.IsAvailable;
            product.StockQuantity = request.StockQuantity;

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

            if (!string.IsNullOrEmpty(request.ProductSizesJson))
            {
                try
                {
                    var newSizes = JsonSerializer.Deserialize<List<CreateProductSizeDto>>(request.ProductSizesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (newSizes != null)
                    {
                        var existingSizes = await _unitOfWork.ProductSize.GetAllAsync(ps => ps.ProductId == id);
                        foreach (var es in existingSizes)
                        {
                            _unitOfWork.ProductSize.Remove(es);
                        }
                        
                        foreach (var s in newSizes)
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
                }
                catch (JsonException ex)
                {
                    throw new Exception($"Lỗi parse chuỗi ProductSizesJson: {ex.Message}");
                }
            }

            await _unitOfWork.SaveAsync();
            var updatedProduct = await GetByIdAsync(product.ProductId);
            return updatedProduct!;
        }

        public async Task ToggleAvailabilityAsync(int id)
        {
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == id);
            if (product == null) throw new ArgumentException("Không tìm thấy sản phẩm!");

            product.IsAvailable = !product.IsAvailable;
            _unitOfWork.Product.Update(product);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var product = await _unitOfWork.Product.GetFirstOrDefaultAsync(p => p.ProductId == id);
            if (product != null)
            {
                // Soft delete để không bị lỗi khóa ngoại (Foreign key) với các bảng như OrderItem
                product.IsAvailable = false;
                _unitOfWork.Product.Update(product);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
