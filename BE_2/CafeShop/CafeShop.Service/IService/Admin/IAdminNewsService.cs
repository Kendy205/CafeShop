using System.Threading.Tasks;
using CafeShop.DTO.News;
using CafeShop.Service.Helpers;

namespace CafeShop.Service.IService.Admin
{
    public interface IAdminNewsService
    {
        Task<PagedResult<NewsListResponseDto>> GetNewsForManagementAsync(string? keyword = null, string? status = null, int pageNumber = 1, int pageSize = 10);
        Task<NewsResponseDto> GetManagementNewsByIdAsync(int id);
        
        Task<NewsResponseDto> CreateNewsAsync(int authorId, CreateNewsRequestDto request);
        Task<NewsResponseDto> UpdateNewsAsync(int id, UpdateNewsRequestDto request);
        Task DeleteNewsAsync(int id);
    }
}
