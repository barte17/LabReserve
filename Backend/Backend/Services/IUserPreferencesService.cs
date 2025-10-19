using Backend.Models;

namespace Backend.Services
{
    public interface IUserPreferencesService
    {
        Task<UserPreferences> GetUserPreferencesAsync(string userId);
        Task<bool> UpdateUserPreferencesAsync(string userId, UserPreferences preferences);
        Task<bool> ShouldSendEmailNotificationAsync(string userId, string notificationType);
        Task<string> GetUserThemeAsync(string userId);
    }
}