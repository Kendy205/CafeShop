using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.News.Requests;
using CafeShop.DTO.News.Responses;
using CafeShop.Model;
using CafeShop.Service.Helpers;
using CafeShop.Service.IService;
using CafeShop.Service.IService.Admin;
using CafeShop.Uitls;

namespace CafeShop.Service.Service.Admin
{
    public class AdminNewsService : IAdminNewsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPhotoService _photoService;
        private readonly IRedisCacheService _redisCache;

        public AdminNewsService(IUnitOfWork unitOfWork, IPhotoService photoService, IRedisCacheService redisCache)
        {
            _unitOfWork = unitOfWork;
            _photoService = photoService;
            _redisCache = redisCache;
        }

        private string GenerateSlug(string title)
        {
            if (string.IsNullOrWhiteSpace(title)) return string.Empty;
            string slug = title.ToLower().Trim();
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-").Trim();
            return slug;
        }

        private async Task<string> GenerateUniqueSlugAsync(string title)
        {
            string baseSlug = GenerateSlug(title);
            string slug = baseSlug;
            int counter = 1;

            while (await _unitOfWork.News.GetFirstOrDefaultAsync(n => n.Slug == slug) != null)
            {
                slug = $"{baseSlug}-{counter}";
                counter++;
            }

            return slug;
        }

        public async Task<PagedResult<NewsListResponseDto>> GetNewsForManagementAsync(string? keyword = null, string? status = null, int pageNumber = 1, int pageSize = 10)
        {
            var total = await _unitOfWork.News.CountNewsSummaryAsync(keyword, status, false);
            var summaryItems = await _unitOfWork.News.GetNewsSummaryAsync(keyword, status, false, pageNumber, pageSize);

            var result = summaryItems.Select(n => new NewsListResponseDto
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

            return new PagedResult<NewsListResponseDto>
            {
                Items = result,
                Total = total,
                Page = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<NewsResponseDto> GetManagementNewsByIdAsync(int id)
        {
            var news = await _unitOfWork.News.GetFirstOrDefaultAsync(
                n => n.NewsId == id && !n.IsDeleted,
                includeProperties: "User");
            
            if (news == null) throw new Exception("Không tìm thấy bài viết");

            return MapToResponseDto(news);
        }

        public async Task<NewsResponseDto> CreateNewsAsync(int authorId, CreateNewsRequestDto request)
        {
            var slug = await GenerateUniqueSlugAsync(request.Title);

            string? imageUrl = null;
            if (request.ImageFile != null)
            {
                var uploadResult = await _photoService.AddPhotoAsync(request.ImageFile);
                if (uploadResult.Error != null)
                    throw new Exception(uploadResult.Error.Message);
                imageUrl = uploadResult.SecureUrl.ToString();
            }

            var news = new News
            {
                Title = request.Title,
                Summary = request.Summary,
                Content = request.Content,
                ImageUrl = imageUrl,
                Slug = slug,
                UserId = authorId,
                Status = string.IsNullOrEmpty(request.Status) ? NewsStatus.Published : request.Status,
                ScheduledPublishAt = request.ScheduledPublishAt,
                PublishedAt = string.IsNullOrEmpty(request.Status) || request.Status == NewsStatus.Published ? DateTime.UtcNow : null,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await _unitOfWork.News.AddAsync(news);
            await _unitOfWork.SaveAsync();

            await _redisCache.BumpVersionAsync("news:ver");

            var createdNews = await _unitOfWork.News.GetFirstOrDefaultAsync(n => n.NewsId == news.NewsId, includeProperties: "User");
            return MapToResponseDto(createdNews!);
        }

        public async Task<NewsResponseDto> UpdateNewsAsync(int id, UpdateNewsRequestDto request)
        {
            var news = await _unitOfWork.News.GetFirstOrDefaultAsync(n => n.NewsId == id && !n.IsDeleted, includeProperties: "User");
            if (news == null) throw new Exception("Không tìm thấy bài viết");

            if (news.Title != request.Title)
            {
                news.Title = request.Title;
                news.Slug = await GenerateUniqueSlugAsync(request.Title);
            }

            if (request.ImageFile != null)
            {
                var uploadResult = await _photoService.AddPhotoAsync(request.ImageFile);
                if (uploadResult.Error != null)
                    throw new Exception(uploadResult.Error.Message);
                news.ImageUrl = uploadResult.SecureUrl.ToString();
            }

            news.Summary = request.Summary;
            news.Content = request.Content;
            
            if (!string.IsNullOrEmpty(request.Status))
            {
                if (news.Status != request.Status && request.Status == NewsStatus.Published)
                {
                    news.PublishedAt = DateTime.UtcNow;
                }
                news.Status = request.Status;
            }
            
            if (request.ScheduledPublishAt.HasValue)
            {
                news.ScheduledPublishAt = request.ScheduledPublishAt;
            }

            news.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.News.Update(news);
            await _unitOfWork.SaveAsync();

            await _redisCache.BumpVersionAsync("news:ver");

            return MapToResponseDto(news);
        }

        public async Task DeleteNewsAsync(int id)
        {
            var news = await _unitOfWork.News.GetFirstOrDefaultAsync(n => n.NewsId == id && !n.IsDeleted);
            if (news == null) throw new Exception("Không tìm thấy bài viết");

            news.IsDeleted = true;
            news.UpdatedAt = DateTime.UtcNow;
            
            _unitOfWork.News.Update(news);
            await _unitOfWork.SaveAsync();

            await _redisCache.BumpVersionAsync("news:ver");
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
