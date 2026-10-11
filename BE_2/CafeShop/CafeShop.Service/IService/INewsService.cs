using System.Threading.Tasks;
using CafeShop.DTO.News.Requests;
using CafeShop.DTO.News.Responses;
using CafeShop.Service.Helpers;

namespace CafeShop.Service.IService
{
    public interface INewsService
    {
        Task<PagedResult<NewsListResponseDto>> GetPublicNewsAsync(string? keyword = null, int pageNumber = 1, int pageSize = 10);
        Task<System.Collections.Generic.List<NewsListResponseDto>> GetLatestNewsAsync(int take = 5);
        Task<NewsResponseDto> GetPublicNewsBySlugAsync(string slug);
        Task IncrementViewCountAsync(int id, string clientId);
    }
}
