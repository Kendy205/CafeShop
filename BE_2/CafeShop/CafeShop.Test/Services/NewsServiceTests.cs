using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CafeShop.Data.Repository.IRepository;
using CafeShop.Repositories.IRepository;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.News.Requests;
using CafeShop.DTO.News.Responses;
using CafeShop.Model;
using CafeShop.Service.IService;
using CafeShop.Service.Service;
using CafeShop.Service.Helpers;
using CafeShop.Uitls;
using Moq;
using Xunit;

namespace CafeShop.Test.Services
{
    public class NewsServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<INewsRepository> _mockNewsRepo;
        private readonly Mock<IRedisCacheService> _mockRedisCache;
        private readonly NewsService _newsService;

        public NewsServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockNewsRepo = new Mock<INewsRepository>();
            _mockRedisCache = new Mock<IRedisCacheService>();

            _mockUnitOfWork.Setup(u => u.News).Returns(_mockNewsRepo.Object);
            _newsService = new NewsService(_mockUnitOfWork.Object, _mockRedisCache.Object);
        }

        [Fact]
        public async Task GetPublicNewsAsync_CacheHit_ReturnsCachedData()
        {
            // Arrange
            var cacheKey = "cafeshop:news:all:page:1:size:10:keyword:none";
            var cachedData = new PagedResult<NewsListResponseDto>
            {
                Items = new List<NewsListResponseDto> { new NewsListResponseDto { Title = "Cached News" } },
                Total = 1,
                Page = 1,
                PageSize = 10
            };

            _mockRedisCache.Setup(c => c.GetAsync<PagedResult<NewsListResponseDto>>(cacheKey))
                .ReturnsAsync(cachedData);

            // Act
            var result = await _newsService.GetPublicNewsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.Items);
            Assert.Equal("Cached News", result.Items.First().Title);
            _mockNewsRepo.Verify(r => r.GetAllAsync(It.IsAny<Expression<Func<News, bool>>>(), It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<Func<IQueryable<News>, IOrderedQueryable<News>>>()), Times.Never);
        }

        [Fact]
        public async Task GetPublicNewsAsync_CacheMiss_ReturnsDataFromRepository()
        {
            // Arrange
            var cacheKey = "cafeshop:news:all:page:1:size:10:keyword:none";
            
            _mockRedisCache.Setup(c => c.GetAsync<PagedResult<NewsListResponseDto>>(cacheKey))
                .ReturnsAsync((PagedResult<NewsListResponseDto>?)null);

            var newsList = new List<News>
            {
                new News { NewsId = 1, Title = "Repo News", Status = NewsStatus.Published, IsDeleted = false }
            };

            _mockNewsRepo.Setup(r => r.CountAsync(It.IsAny<Expression<Func<News, bool>>>()))
                .ReturnsAsync(1);

            _mockNewsRepo.Setup(r => r.GetAllAsync(It.IsAny<Expression<Func<News, bool>>>(), It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<Func<IQueryable<News>, IOrderedQueryable<News>>>()))
                .ReturnsAsync(newsList);

            // Act
            var result = await _newsService.GetPublicNewsAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.Items);
            Assert.Equal("Repo News", result.Items.First().Title);
        }

        [Fact]
        public async Task GetPublicNewsAsync_CacheMiss_CachesRepositoryResult()
        {
            // Arrange
            var cacheKey = "cafeshop:news:all:page:1:size:10:keyword:none";
            
            _mockRedisCache.Setup(c => c.GetAsync<PagedResult<NewsListResponseDto>>(cacheKey))
                .ReturnsAsync((PagedResult<NewsListResponseDto>?)null);

            var newsList = new List<News>
            {
                new News { NewsId = 1, Title = "Repo News", Status = NewsStatus.Published, IsDeleted = false }
            };

            _mockNewsRepo.Setup(r => r.CountAsync(It.IsAny<Expression<Func<News, bool>>>()))
                .ReturnsAsync(1);

            _mockNewsRepo.Setup(r => r.GetAllAsync(It.IsAny<Expression<Func<News, bool>>>(), It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<Func<IQueryable<News>, IOrderedQueryable<News>>>()))
                .ReturnsAsync(newsList);

            // Act
            await _newsService.GetPublicNewsAsync();

            // Assert
            _mockRedisCache.Verify(c => c.SetAsync(cacheKey, It.IsAny<PagedResult<NewsListResponseDto>>(), It.IsAny<TimeSpan>()), Times.Once);
        }
    }
}
