using System;
using System.Threading.Tasks;

namespace CafeShop.Service.IService
{
    public interface IRedisCacheService
    {
        Task<T?> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan expiration);
        Task RemoveAsync(string key);
        Task RemoveByPrefixAsync(string prefixKey);
    }
}
