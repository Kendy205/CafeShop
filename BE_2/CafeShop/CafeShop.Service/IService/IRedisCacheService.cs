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

        Task<long> GetVersionAsync(string key);
        Task BumpVersionAsync(string key);
        Task<long> IncrementAsync(string key);
        Task<long> GetAndResetAsync(string key);
        Task<bool> TryLockAsync(string key, TimeSpan ttl);
    }
}
