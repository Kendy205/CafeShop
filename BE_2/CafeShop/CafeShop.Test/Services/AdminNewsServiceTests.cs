using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CafeShop.Data.Repository.IRepository;
using CafeShop.Repositories.IRepository;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.News;
using CafeShop.Model;
using CafeShop.Service.Service.Admin;
using CafeShop.Uitls;
using CafeShop.Service.IService;
using Moq;
using Xunit;

namespace CafeShop.Test.Services
{
    public class AdminNewsServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<INewsRepository> _mockNewsRepo;
        private readonly Mock<IPhotoService> _mockPhotoService;
        private readonly AdminNewsService _adminNewsService;

        public AdminNewsServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockNewsRepo = new Mock<INewsRepository>();
            _mockPhotoService = new Mock<IPhotoService>();
            var _mockRedisCache = new Mock<IRedisCacheService>();
            
            _mockUnitOfWork.Setup(u => u.News).Returns(_mockNewsRepo.Object);
            _adminNewsService = new AdminNewsService(_mockUnitOfWork.Object, _mockPhotoService.Object, _mockRedisCache.Object);
        }

        [Fact]
        public async Task CreateNewsAsync_ShouldReturnCreatedNews_WhenValidRequest()
        {
            // Arrange
            int authorId = 1;
            var request = new CreateNewsRequestDto
            {
                Title = "Test Title",
                Summary = "Test Summary",
                Content = "Test Content"
            };

            var newsList = new List<News>();
            
            // Setup GetFirstOrDefaultAsync to simulate slug checking and refetching
            _mockNewsRepo.Setup(r => r.GetFirstOrDefaultAsync(It.IsAny<Expression<Func<News, bool>>>(), It.IsAny<string?>()))
                .ReturnsAsync((Expression<Func<News, bool>> filter, string? include) => 
                    newsList.AsQueryable().FirstOrDefault(filter));

            // Setup AddAsync
            _mockNewsRepo.Setup(r => r.AddAsync(It.IsAny<News>()))
                .Callback<News>(n => 
                {
                    n.NewsId = 1;
                    newsList.Add(n);
                })
                .Returns(Task.CompletedTask);

            // Act
            var result = await _adminNewsService.CreateNewsAsync(authorId, request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Title", result.Title);
            Assert.Equal("test-title", result.Slug);
            Assert.Equal(NewsStatus.Published, result.Status);
            _mockUnitOfWork.Verify(u => u.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateNewsAsync_ShouldSuccess_WhenValid()
        {
            // Arrange
            int id = 1;
            int userId = 1;

            var existingNews = new News
            {
                NewsId = id,
                UserId = userId,
                Title = "Old Title",
                Status = NewsStatus.Published
            };

            _mockNewsRepo.Setup(r => r.GetFirstOrDefaultAsync(It.IsAny<Expression<Func<News, bool>>>(), It.IsAny<string?>()))
                .ReturnsAsync(existingNews);

            var request = new UpdateNewsRequestDto { Title = "New Title", Content = "New Content" };

            // Act
            var result = await _adminNewsService.UpdateNewsAsync(id, request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Content", result.Content);
            _mockUnitOfWork.Verify(u => u.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteNewsAsync_ShouldSoftDelete_WhenValid()
        {
            // Arrange
            int id = 1;
            int userId = 1;

            var existingNews = new News
            {
                NewsId = id,
                UserId = userId,
                Title = "Test Title",
                IsDeleted = false
            };

            _mockNewsRepo.Setup(r => r.GetFirstOrDefaultAsync(It.IsAny<Expression<Func<News, bool>>>(), It.IsAny<string?>()))
                .ReturnsAsync(existingNews);

            // Act
            await _adminNewsService.DeleteNewsAsync(id);

            // Assert
            Assert.True(existingNews.IsDeleted);
            _mockUnitOfWork.Verify(u => u.SaveAsync(), Times.Once);
        }
    }
}
