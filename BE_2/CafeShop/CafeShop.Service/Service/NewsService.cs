using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.Data.Repository.Extensions;
using CafeShop.DTO.News.Requests;
using CafeShop.DTO.News.Responses;
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

        public NewsService(IUnitOfWork unitOfWork, IRedisCacheService redisCache)
        {
            _unitOfWork = unitOfWork;
            _redisCache = redisCache;
        }

        public async Task<PagedResult<NewsListResponseDto>> GetPublicNewsAsync(string? keyword = null, int pageNumber = 1, int pageSize = 10)
        {
            pageSize = Math.Clamp(pageSize, 1, 50);
            var version = await _redisCache.GetVersionAsync("news:ver");
            string cacheKey = $"news:list:p{pageNumber}s{pageSize}k{keyword}:v{version}";
            
            var cachedResult = await _redisCache.GetAsync<PagedResult<NewsListResponseDto>>(cacheKey);
            if (cachedResult != null) return cachedResult;

            var totalCount = await _unitOfWork.News.CountNewsSummaryAsync(keyword, null, true);
            var summaryItems = await _unitOfWork.News.GetNewsSummaryAsync(keyword, null, true, pageNumber, pageSize);

            var items = summaryItems.Select(n => new NewsListResponseDto
            {
                NewsId = n.NewsId,
                Title = n.Title,
                Slug = n.Slug,
                Summary = n.Summary,
                ImageUrl = n.ImageUrl,
                Status = n.Status,
                AuthorName = n.AuthorName,
                PublishedAt = n.PublishedAt,
                CreatedAt = n.CreatedAt,
                ViewCount = n.ViewCount
            }).ToList();

            var pagedResult = new PagedResult<NewsListResponseDto>
            {
                Items = items,
                Total = totalCount,
                Page = pageNumber,
                PageSize = pageSize
            };
            
            await _redisCache.SetAsync(cacheKey, pagedResult, TimeSpan.FromMinutes(5));
            return pagedResult;
        }

        public async Task<System.Collections.Generic.List<NewsListResponseDto>> GetLatestNewsAsync(int take = 5)
        {
            take = Math.Clamp(take, 1, 20);
            var version = await _redisCache.GetVersionAsync("news:ver");
            string cacheKey = $"news:latest:t{take}:v{version}";

            var cachedResult = await _redisCache.GetAsync<System.Collections.Generic.List<NewsListResponseDto>>(cacheKey);
            if (cachedResult != null) return cachedResult;

            var result = await _unitOfWork.News.GetQueryable()
                .AsNoTracking()
                .Include(n => n.User)
                .Published()
                .OrderByDescending(n => n.PublishedAt)
                .Take(take)
                .Select(n => new NewsListResponseDto
                {
                    NewsId = n.NewsId,
                    Title = n.Title,
                    Slug = n.Slug,
                    Summary = n.Summary,
                    ImageUrl = n.ImageUrl,
                    Status = n.Status,
                    AuthorName = n.User != null ? (n.User.FullName ?? n.User.Username) : "Admin",
                    PublishedAt = n.PublishedAt,
                    CreatedAt = n.CreatedAt,
                    ViewCount = n.ViewCount
                }).ToListAsync();
            
            await _redisCache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5));
            return result;
        }

        public async Task<NewsResponseDto> GetPublicNewsBySlugAsync(string slug)
        {
            var version = await _redisCache.GetVersionAsync("news:ver");
            string cacheKey = $"news:detail:{slug}:v{version}";

            var cachedResult = await _redisCache.GetAsync<NewsResponseDto>(cacheKey);
            if (cachedResult != null) return cachedResult;

            var newsDto = await _unitOfWork.News.GetQueryable()
                .AsNoTracking()
                .Include(n => n.User)
                .Published()
                .Where(n => n.Slug == slug)
                .Select(n => new NewsResponseDto
                {
                    NewsId = n.NewsId,
                    UserId = n.UserId,
                    AuthorName = n.User != null ? (n.User.FullName ?? n.User.Username) : "Admin",
                    Title = n.Title,
                    Slug = n.Slug,
                    Summary = n.Summary,
                    Content = n.Content,
                    ImageUrl = n.ImageUrl,
                    Status = n.Status,
                    ScheduledPublishAt = n.ScheduledPublishAt,
                    PublishedAt = n.PublishedAt,
                    CreatedAt = n.CreatedAt,
                    UpdatedAt = n.UpdatedAt,
                    ViewCount = n.ViewCount
                }).FirstOrDefaultAsync();

            if (newsDto == null) 
                throw new Exception("Không tìm thấy bài viết hoặc bài viết chưa được xuất bản");

            await _redisCache.SetAsync(cacheKey, newsDto, TimeSpan.FromMinutes(15));
            return newsDto;
        }

        public async Task IncrementViewCountAsync(int id, string clientId)
        {
            string lockKey = $"news:viewed:{id}:{clientId}";
            bool acquired = await _redisCache.TryLockAsync(lockKey, TimeSpan.FromMinutes(30));
            
            if (acquired)
            {
                await _redisCache.IncrementAsync($"news:views:{id}");
            }
        }
    }
}
