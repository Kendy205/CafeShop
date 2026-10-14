using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Data.Repository.IRepository;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Feedback.Responses;
using CafeShop.DTO.Product.Responses;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Service.IService;
using CafeShop.Service.IService.Users;
using CafeShop.Service.Service.Users;
using CafeShop.Services.Services;
using Moq;
using Xunit;

namespace CafeShop.Test.Services
{
    public class FeedbackAndProductDetailTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IFeedbackRepository> _mockFeedbackRepo;
        private readonly Mock<IProductRepository> _mockProductRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IPhotoService> _mockPhotoService;
        private readonly Mock<IRedisCacheService> _mockRedisCache;

        public FeedbackAndProductDetailTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockFeedbackRepo = new Mock<IFeedbackRepository>();
            _mockProductRepo = new Mock<IProductRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockPhotoService = new Mock<IPhotoService>();
            _mockRedisCache = new Mock<IRedisCacheService>();

            _mockUnitOfWork.Setup(u => u.Feedback).Returns(_mockFeedbackRepo.Object);
            _mockUnitOfWork.Setup(u => u.Product).Returns(_mockProductRepo.Object);
            _mockRedisCache.Setup(c => c.GetVersionAsync("products:ver")).ReturnsAsync(1);
        }

        [Fact]
        public async Task GetFeedbackSummaryAsync_WithReviews_CalculatesDistributionCorrectly()
        {
            // Arrange: 6 reviews: 2 five-star, 2 four-star, 2 three-star (matching the UI screenshot)
            int productId = 10;
            _mockFeedbackRepo.Setup(r => r.GetFeedbackSummaryForProductAsync(productId))
                .ReturnsAsync((6, 4.0, 2, 2, 2, 0, 0));

            var feedbackService = new FeedbackService(_mockUnitOfWork.Object, _mockMapper.Object, _mockPhotoService.Object);

            // Act
            var result = await feedbackService.GetFeedbackSummaryAsync(productId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(productId, result.ProductId);
            Assert.Equal(6, result.TotalReviews);
            Assert.Equal(4.0, result.AverageRating);

            // Check counts
            Assert.Equal(2, result.Distribution[5]);
            Assert.Equal(2, result.Distribution[4]);
            Assert.Equal(2, result.Distribution[3]);
            Assert.Equal(0, result.Distribution[2]);
            Assert.Equal(0, result.Distribution[1]);
        }

        [Fact]
        public async Task GetFeedbackSummaryAsync_NoReviews_ReturnsDefaultDistributionWithoutError()
        {
            // Arrange
            int productId = 99;
            _mockFeedbackRepo.Setup(r => r.GetFeedbackSummaryForProductAsync(productId))
                .ReturnsAsync((0, 0.0, 0, 0, 0, 0, 0));

            var feedbackService = new FeedbackService(_mockUnitOfWork.Object, _mockMapper.Object, _mockPhotoService.Object);

            // Act
            var result = await feedbackService.GetFeedbackSummaryAsync(productId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.TotalReviews);
            Assert.Equal(0.0, result.AverageRating);
            Assert.Equal(0, result.Distribution[5]);
            Assert.Equal(0, result.Distribution[1]);
        }

        [Fact]
        public async Task GetRelatedProductsAsync_CacheHit_ReturnsCachedList()
        {
            // Arrange
            int productId = 10;
            int limit = 4;
            string cacheKey = $"cafeshop:products:related:v1:{productId}:{limit}";
            var cachedList = new List<ProductResponseDto>
            {
                new ProductResponseDto { ProductId = 11, Name = "Soda Việt Quất" },
                new ProductResponseDto { ProductId = 12, Name = "Soda Chanh" }
            };

            _mockRedisCache.Setup(c => c.GetAsync<IEnumerable<ProductResponseDto>>(cacheKey))
                .ReturnsAsync(cachedList);

            var productService = new ProductService(_mockUnitOfWork.Object, _mockMapper.Object, _mockPhotoService.Object, _mockRedisCache.Object);

            // Act
            var result = await productService.GetRelatedProductsAsync(productId, limit);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            _mockProductRepo.Verify(r => r.GetRelatedProductsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task GetRelatedProductsAsync_ProductNotFound_ReturnsEmpty()
        {
            // Arrange
            int productId = 999;
            int limit = 4;
            string cacheKey = $"cafeshop:products:related:v1:{productId}:{limit}";

            _mockRedisCache.Setup(c => c.GetAsync<IEnumerable<ProductResponseDto>>(cacheKey))
                .ReturnsAsync((IEnumerable<ProductResponseDto>?)null);

            _mockProductRepo.Setup(r => r.GetFirstOrDefaultAsync(
                It.IsAny<Expression<Func<Product, bool>>>(),
                It.IsAny<string>()
            )).ReturnsAsync((Product?)null);

            var productService = new ProductService(_mockUnitOfWork.Object, _mockMapper.Object, _mockPhotoService.Object, _mockRedisCache.Object);

            // Act
            var result = await productService.GetRelatedProductsAsync(productId, limit);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetRelatedProductsAsync_CacheMiss_FetchesFromRepoAndCaches()
        {
            // Arrange
            int productId = 10;
            int categoryId = 2;
            int limit = 4;
            string cacheKey = $"cafeshop:products:related:v1:{productId}:{limit}";

            var currentProduct = new Product
            {
                ProductId = productId,
                CategoryId = categoryId,
                Name = "Soda Đào",
                IsAvailable = true,
                IsDeleted = false
            };

            var relatedEntities = new List<Product>
            {
                new Product { ProductId = 20, CategoryId = categoryId, Name = "Soda Bạc Hà", IsAvailable = true }
            };

            IEnumerable<ProductResponseDto> mappedDtos = new List<ProductResponseDto>
            {
                new ProductResponseDto { ProductId = 20, CategoryId = categoryId, Name = "Soda Bạc Hà" }
            };

            _mockRedisCache.Setup(c => c.GetAsync<IEnumerable<ProductResponseDto>>(cacheKey))
                .ReturnsAsync((IEnumerable<ProductResponseDto>?)null);

            _mockProductRepo.Setup(r => r.GetFirstOrDefaultAsync(
                It.IsAny<Expression<Func<Product, bool>>>(),
                It.IsAny<string>()
            )).ReturnsAsync(currentProduct);

            _mockProductRepo.Setup(r => r.GetRelatedProductsAsync(productId, categoryId, limit))
                .ReturnsAsync(relatedEntities);

            _mockMapper.Setup(m => m.Map<IEnumerable<ProductResponseDto>>(relatedEntities))
                .Returns(mappedDtos);

            var productService = new ProductService(_mockUnitOfWork.Object, _mockMapper.Object, _mockPhotoService.Object, _mockRedisCache.Object);

            // Act
            var result = await productService.GetRelatedProductsAsync(productId, limit);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("Soda Bạc Hà", result.First().Name);

            _mockRedisCache.Verify(c => c.SetAsync(cacheKey, mappedDtos, It.IsAny<TimeSpan>()), Times.Once);
        }

        [Fact]
        public async Task DeleteProductAsync_BumpsProductCacheVersion()
        {
            // Arrange
            int productId = 10;
            var product = new Product { ProductId = productId, IsAvailable = true, IsDeleted = false };
            _mockProductRepo.Setup(r => r.GetFirstOrDefaultAsync(
                It.IsAny<Expression<Func<Product, bool>>>(),
                It.IsAny<string>()
            )).ReturnsAsync(product);

            var adminProductService = new CafeShop.Service.Service.Admin.AdminProductService(
                _mockUnitOfWork.Object, _mockMapper.Object, _mockPhotoService.Object, _mockRedisCache.Object
            );

            // Act
            await adminProductService.DeleteAsync(productId);

            // Assert
            _mockRedisCache.Verify(c => c.RemoveAsync($"cafeshop:products:id:{productId}"), Times.Once);
            _mockRedisCache.Verify(c => c.BumpVersionAsync("products:ver"), Times.Once);
        }
    }
}
