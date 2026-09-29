using System;
using System.Linq;
using System.Threading.Tasks;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.News;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using CafeShop.Uitls;

namespace CafeShop.Service.Service
{
    public class NewsService : INewsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRedisCacheService _redisCache;
        private readonly TimeSpan _defaultCacheExpiration = TimeSpan.FromMinutes(5);

        public NewsService(IUnitOfWork unitOfWork, IRedisCacheService redisCache)
        {
            _unitOfWork = unitOfWork;
            _redisCache = redisCache;
        }

        public async Task<PagedResult<NewsListResponseDto>> GetPublicNewsAsync(string? keyword = null, int pageNumber = 1, int pageSize = 10)
        {
            string cacheKey = $"cafeshop:news:all:page:{pageNumber}:size:{pageSize}:keyword:{keyword ?? "none"}";
            
            var cachedResult = await _redisCache.GetAsync<PagedResult<NewsListResponseDto>>(cacheKey);
            if (cachedResult != null)
            {
                return cachedResult;
            }

            var filter = (System.Linq.Expressions.Expression<Func<News, bool>>)(n => 
                !n.IsDeleted && 
                n.Status == NewsStatus.Published &&
                (string.IsNullOrEmpty(keyword) || (n.Title != null && n.Title.Contains(keyword))));

            int total = await _unitOfWork.News.CountAsync(filter);
            
            var newsItems = await _unitOfWork.News.GetAllAsync(
                filter: filter,
                includeProperties: "User",
                pageSize: pageSize,
                pageNumber: pageNumber,
                orderBy: q => q.OrderByDescending(n => n.PublishedAt ?? n.CreatedAt));

            var result = newsItems.Select(n => new NewsListResponseDto
            {
                NewsId = n.NewsId,
                Title = n.Title,
                Slug = n.Slug,
                Summary = n.Summary,
                ImageUrl = n.ImageUrl,
                Status = n.Status,
                AuthorName = n.User?.FullName ?? n.User?.Username,
                PublishedAt = n.PublishedAt,
                CreatedAt = n.CreatedAt,
                ViewCount = n.ViewCount
            }).ToList();

            var pagedResult = new PagedResult<NewsListResponseDto>
            {
                Items = result,
                Total = total,
                Page = pageNumber,
                PageSize = pageSize
            };

            await _redisCache.SetAsync(cacheKey, pagedResult, _defaultCacheExpiration);
            return pagedResult;
        }

        public async Task<NewsResponseDto> GetPublicNewsByIdAsync(int id)
        {
            string cacheKey = $"cafeshop:news:id:{id}";
            var cachedResult = await _redisCache.GetAsync<NewsResponseDto>(cacheKey);
            if (cachedResult != null)
            {
                // Note: We might want to increment ViewCount asynchronously or bypass cache for strictly accurate view counts
                // For this implementation, we will serve from cache and maybe update DB view count in background or skip it for simplicity
                return cachedResult;
            }

            var news = await _unitOfWork.News.GetFirstOrDefaultAsync(
                n => n.NewsId == id && !n.IsDeleted && n.Status == NewsStatus.Published,
                includeProperties: "User");
            
            if (news == null) throw new Exception("Không tìm thấy bài viết hoặc bài viết chưa được xuất bản");

            news.ViewCount++;
            _unitOfWork.News.Update(news);
            await _unitOfWork.SaveAsync();

            var responseDto = MapToResponseDto(news);
            await _redisCache.SetAsync(cacheKey, responseDto, _defaultCacheExpiration);
            return responseDto;
        }

        public async Task<NewsResponseDto> GetPublicNewsBySlugAsync(string slug)
        {
            string cacheKey = $"cafeshop:news:slug:{slug}";
            var cachedResult = await _redisCache.GetAsync<NewsResponseDto>(cacheKey);
            if (cachedResult != null) return cachedResult;

            var news = await _unitOfWork.News.GetFirstOrDefaultAsync(
                n => n.Slug == slug && !n.IsDeleted && n.Status == NewsStatus.Published,
                includeProperties: "User");
            
            if (news == null) throw new Exception("Không tìm thấy bài viết hoặc bài viết chưa được xuất bản");

            news.ViewCount++;
            _unitOfWork.News.Update(news);
            await _unitOfWork.SaveAsync();

            var responseDto = MapToResponseDto(news);
            await _redisCache.SetAsync(cacheKey, responseDto, _defaultCacheExpiration);
            return responseDto;
        }

        private NewsResponseDto MapToResponseDto(News news)
        {
            return new NewsResponseDto
            {
                NewsId = news.NewsId,
                UserId = news.UserId,
                AuthorName = news.User?.FullName ?? news.User?.Username,
                Title = news.Title,
                Slug = news.Slug,
                Summary = news.Summary,
                Content = news.Content,
                ImageUrl = news.ImageUrl,
                Status = news.Status,
                ScheduledPublishAt = news.ScheduledPublishAt,
                PublishedAt = news.PublishedAt,
                CreatedAt = news.CreatedAt,
                UpdatedAt = news.UpdatedAt,
                ViewCount = news.ViewCount
            };
        }
    }
}
