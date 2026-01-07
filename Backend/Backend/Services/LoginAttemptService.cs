using Microsoft.Extensions.Caching.Memory;

namespace Backend.Services
{
    /// <summary>
    /// Implementation of login attempt tracking using in-memory cache
    /// Tracks failed login attempts per IP and blocks IPs after too many failures
    /// </summary>
    public class LoginAttemptService : ILoginAttemptService
    {
        private readonly IMemoryCache _cache;
        private const int MaxAttempts = 5;
        private const int BlockDurationMinutes = 15;
        private const int AttemptWindowMinutes = 15; // Track attempts within 15 minute window

        public LoginAttemptService(IMemoryCache cache)
        {
            _cache = cache;
        }

        private string GetAttemptsKey(string ipAddress) => $"login_attempts:{ipAddress}";
        private string GetBlockKey(string ipAddress) => $"ip_blocked:{ipAddress}";

        public Task<bool> IsIpBlockedAsync(string ipAddress)
        {
            var blockKey = GetBlockKey(ipAddress);
            var isBlocked = _cache.TryGetValue(blockKey, out _);
            return Task.FromResult(isBlocked);
        }

        public async Task RecordFailedAttemptAsync(string ipAddress)
        {
            var attemptsKey = GetAttemptsKey(ipAddress);
            
            // Get current attempt count
            if (!_cache.TryGetValue(attemptsKey, out int attemptCount))
            {
                attemptCount = 0;
            }

            attemptCount++;

            // Store updated count with sliding expiration
            var cacheOptions = new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(AttemptWindowMinutes)
            };
            _cache.Set(attemptsKey, attemptCount, cacheOptions);

            // If max attempts reached, block the IP
            if (attemptCount >= MaxAttempts)
            {
                var blockKey = GetBlockKey(ipAddress);
                var blockOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(BlockDurationMinutes)
                };
                
                // Store block time for calculating remaining time
                _cache.Set(blockKey, DateTimeOffset.UtcNow.AddMinutes(BlockDurationMinutes), blockOptions);
            }

            await Task.CompletedTask;
        }

        public Task ResetAttemptsAsync(string ipAddress)
        {
            var attemptsKey = GetAttemptsKey(ipAddress);
            _cache.Remove(attemptsKey);
            return Task.CompletedTask;
        }

        public Task<int> GetRemainingAttemptsAsync(string ipAddress)
        {
            var attemptsKey = GetAttemptsKey(ipAddress);
            
            if (!_cache.TryGetValue(attemptsKey, out int attemptCount))
            {
                attemptCount = 0;
            }

            var remaining = Math.Max(0, MaxAttempts - attemptCount);
            return Task.FromResult(remaining);
        }

        public Task<TimeSpan?> GetBlockTimeRemainingAsync(string ipAddress)
        {
            var blockKey = GetBlockKey(ipAddress);
            
            if (_cache.TryGetValue(blockKey, out DateTimeOffset blockUntil))
            {
                var remaining = blockUntil - DateTimeOffset.UtcNow;
                if (remaining.TotalSeconds > 0)
                {
                    return Task.FromResult<TimeSpan?>(remaining);
                }
            }

            return Task.FromResult<TimeSpan?>(null);
        }
    }
}
