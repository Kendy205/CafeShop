using System;
using System.Text.Json;
using System.Threading.Tasks;
using CafeShop.Service.IService;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace CafeShop.Service.Service
{
    public class RedisCacheService : IRedisCacheService
    {
        private readonly IDistributedCache _cache;
        private readonly IConnectionMultiplexer _multiplexer;
        private readonly ILogger<RedisCacheService> _logger;

        public RedisCacheService(IDistributedCache cache, IConnectionMultiplexer multiplexer, ILogger<RedisCacheService> logger)
        {
            _cache = cache;
            _multiplexer = multiplexer;
            _logger = logger;
        }

        /// <summary>
        /// Tạo key có prefix "CafeShop_" để tránh xung đột key khi chạy chung Redis instance
        /// </summary>
        private string Prefixed(string key) => $"CafeShop_{key}";

        /// <summary>
        /// Đọc dữ liệu từ Redis và deserialize thành đối tượng kiểu T (trả về null nếu Cache Miss hoặc lỗi)
        /// </summary>
        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var cachedValue = await _cache.GetStringAsync(key);
                if (cachedValue != null)
                {
                    _logger.LogDebug($"Redis cache HIT: {key}");
                    return JsonSerializer.Deserialize<T>(cachedValue);
                }
                _logger.LogDebug($"Redis cache MISS: {key}");
                return default;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error when getting key: {key}");
                return default;
            }
        }

        /// <summary>
        /// Lưu đối tượng vào Redis dưới dạng JSON kèm thời gian sống (áp dụng Jitter +/- 10% tránh sập Cache Avalanche)
        /// </summary>
        public async Task SetAsync<T>(string key, T value, TimeSpan expiration)
        {
            try
            {
                // Jitter +/- 10% ngẫu nhiên thời gian hết hạn để các key không hết hạn cùng lúc
                var random = new Random();
                var jitterMultiplier = 0.9 + (random.NextDouble() * 0.2);
                var jitteredExpiration = TimeSpan.FromMilliseconds(expiration.TotalMilliseconds * jitterMultiplier);

                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = jitteredExpiration
                };

                var serializedValue = JsonSerializer.Serialize(value);
                await _cache.SetStringAsync(key, serializedValue, options);
                _logger.LogDebug($"Redis cache SET: {key}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error when setting key: {key}");
            }
        }

        /// <summary>
        /// Xóa chính xác một key khỏi Redis
        /// </summary>
        public async Task RemoveAsync(string key)
        {
            try
            {
                await _cache.RemoveAsync(key);
                _logger.LogDebug($"Redis cache REMOVE: {key}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error when removing key: {key}");
            }
        }

        /// <summary>
        /// Xóa hàng loạt tất cả các key bắt đầu bằng một tiền tố (dùng khi cập nhật dữ liệu muốn clear cả nhóm)
        /// </summary>
        public async Task RemoveByPrefixAsync(string prefixKey)
        {
            try
            {
                var db = _multiplexer.GetDatabase();
                var endpoints = _multiplexer.GetEndPoints();
                var pattern = Prefixed(prefixKey) + "*";
                
                foreach (var endpoint in endpoints)
                {
                    var server = _multiplexer.GetServer(endpoint);
                    if (server.IsConnected)
                    {
                        var keys = server.KeysAsync(pattern: pattern);
                        await foreach (var key in keys)
                        {
                            await db.KeyDeleteAsync(key);
                        }
                    }
                }
                _logger.LogDebug($"Redis cache REMOVE PREFIX: {prefixKey}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error when removing prefix: {prefixKey}");
            }
        }

        /// <summary>
        /// Lấy số phiên bản (version) hiện tại của nhóm cache để kiểm tra tính hợp lệ
        /// </summary>
        public async Task<long> GetVersionAsync(string key)
        {
            try
            {
                var db = _multiplexer.GetDatabase();
                var value = await db.StringGetAsync(Prefixed(key));
                if (value.HasValue && long.TryParse(value, out var version))
                    return version;
                return 1; // Default version
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error GetVersionAsync: {key}");
                return 1;
            }
        }

        /// <summary>
        /// Tăng version nhóm cache lên 1 (làm vô hiệu hóa tức thì toàn bộ cache cũ mà không cần lặp xóa từng key)
        /// </summary>
        public async Task BumpVersionAsync(string key)
        {
            try
            {
                var db = _multiplexer.GetDatabase();
                await db.StringIncrementAsync(Prefixed(key));
                _logger.LogDebug($"Redis cache BUMP VERSION: {key}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error BumpVersionAsync: {key}");
            }
        }

        /// <summary>
        /// Tăng biến đếm nguyên tử lên 1 (atomic counter - dùng đếm view, rate limit)
        /// </summary>
        public async Task<long> IncrementAsync(string key)
        {
            try
            {
                var db = _multiplexer.GetDatabase();
                return await db.StringIncrementAsync(Prefixed(key));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error IncrementAsync: {key}");
                return 0;
            }
        }

        /// <summary>
        /// Đọc giá trị biến đếm và xóa ngay lập tức (atomic read & delete - dùng đồng bộ view count về DB định kỳ)
        /// </summary>
        public async Task<long> GetAndResetAsync(string key)
        {
            try
            {
                var db = _multiplexer.GetDatabase();
                var val = await db.StringGetDeleteAsync(Prefixed(key));
                if (val.HasValue && long.TryParse(val, out var count))
                    return count;
                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error GetAndResetAsync: {key}");
                return 0;
            }
        }

        /// <summary>
        /// Khóa phân tán (Distributed Lock - SETNX) chống Race Condition trong môi trường nhiều request/server
        /// </summary>
        public async Task<bool> TryLockAsync(string key, TimeSpan ttl)
        {
            try
            {
                var db = _multiplexer.GetDatabase();
                return await db.StringSetAsync(Prefixed(key), "locked", ttl, StackExchange.Redis.When.NotExists);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Redis cache error TryLockAsync: {key}");
                return false;
            }
        }
    }
}
