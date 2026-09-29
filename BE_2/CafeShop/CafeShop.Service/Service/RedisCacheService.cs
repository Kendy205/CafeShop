using System;
using System.Text.Json;
using System.Threading.Tasks;
using CafeShop.Service.IService;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace CafeShop.Service.Service
{
    public class RedisCacheService : IRedisCacheService
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<RedisCacheService> _logger;

        public RedisCacheService(IDistributedCache cache, ILogger<RedisCacheService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var cachedValue = await _cache.GetStringAsync(key);
                if (cachedValue != null)
                {
                    _logger.LogInformation($"Redis cache HIT: {key}");
                    return JsonSerializer.Deserialize<T>(cachedValue);
                }

                _logger.LogInformation($"Redis cache MISS: {key}");
                return default;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error when getting key: {key}");
                return default; // Fallback to database
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan expiration)
        {
            try
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiration
                };

                var serializedValue = JsonSerializer.Serialize(value);
                await _cache.SetStringAsync(key, serializedValue, options);
                _logger.LogInformation($"Redis cache SET: {key}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error when setting key: {key}");
            }
        }

        public async Task RemoveAsync(string key)
        {
            try
            {
                await _cache.RemoveAsync(key);
                _logger.LogInformation($"Redis cache REMOVE: {key}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error when removing key: {key}");
            }
        }

        public async Task RemoveByPrefixAsync(string prefixKey)
        {
            // Note: IDistributedCache doesn't support wildcard deleting directly. 
            // In a real StackExchange.Redis implementation we would use `IServer.Keys(pattern)`.
            // For now, if we need wildcard we might need StackExchange.Redis directly.
            // Since we use IDistributedCache, we'll assume we pass exact keys to RemoveAsync.
            // For simple cache-aside we can just manage explicit keys.
            throw new NotImplementedException("RemoveByPrefixAsync requires StackExchange.Redis ConnectionMultiplexer.");
        }
    }
}
