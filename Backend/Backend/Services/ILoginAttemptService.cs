namespace Backend.Services
{
    /// <summary>
    /// Service for tracking login attempts per IP address and managing IP-based blocking
    /// </summary>
    public interface ILoginAttemptService
    {
        /// <summary>
        /// Checks if the given IP address is currently blocked
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <returns>True if IP is blocked, false otherwise</returns>
        Task<bool> IsIpBlockedAsync(string ipAddress);

        /// <summary>
        /// Records a failed login attempt for the given IP address
        /// </summary>
        /// <param name="ipAddress">IP address that failed login</param>
        /// <returns>Task</returns>
        Task RecordFailedAttemptAsync(string ipAddress);

        /// <summary>
        /// Resets the failed attempt counter for the given IP address (called on successful login)
        /// </summary>
        /// <param name="ipAddress">IP address to reset</param>
        /// <returns>Task</returns>
        Task ResetAttemptsAsync(string ipAddress);

        /// <summary>
        /// Gets the number of remaining login attempts before IP block
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <returns>Number of remaining attempts (0-5)</returns>
        Task<int> GetRemainingAttemptsAsync(string ipAddress);

        /// <summary>
        /// Gets the remaining time until IP is unblocked
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <returns>TimeSpan until unblock, or null if not blocked</returns>
        Task<TimeSpan?> GetBlockTimeRemainingAsync(string ipAddress);
    }
}
