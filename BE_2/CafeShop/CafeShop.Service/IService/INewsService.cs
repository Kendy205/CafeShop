using System.Threading.Tasks;
using CafeShop.DTO.News;
using CafeShop.Service.Helpers;

namespace CafeShop.Service.IService
{
    public interface INewsService
    {
        Task<PagedResult<NewsListResponseDto>> GetPublicNewsAsync(string? keyword = null, int pageNumber = 1, int pageSize = 10);
        Task<NewsResponseDto> GetPublicNewsByIdAsync(int id);
        Task<NewsResponseDto> GetPublicNewsBySlugAsync(string slug);
    }
}
