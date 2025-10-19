using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend.Services
{
    public class UserPreferencesService : IUserPreferencesService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UserPreferencesService> _logger;

        public UserPreferencesService(AppDbContext context, ILogger<UserPreferencesService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<UserPreferences> GetUserPreferencesAsync(string userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning($"Użytkownik {userId} nie został znaleziony");
                    return UserPreferences.GetDefault();
                }

                if (string.IsNullOrWhiteSpace(user.Preferences) || user.Preferences == "{}")
                {
                    return UserPreferences.GetDefault();
                }

                var preferences = JsonSerializer.Deserialize<UserPreferences>(user.Preferences);
                return preferences ?? UserPreferences.GetDefault();
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, $"Błąd deserializacji preferencji dla użytkownika {userId}");
                return UserPreferences.GetDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas pobierania preferencji dla użytkownika {userId}");
                return UserPreferences.GetDefault();
            }
        }

        public async Task<bool> UpdateUserPreferencesAsync(string userId, UserPreferences preferences)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning($"Użytkownik {userId} nie został znaleziony");
                    return false;
                }

                var preferencesJson = JsonSerializer.Serialize(preferences);
                user.Preferences = preferencesJson;

                await _context.SaveChangesAsync();
                _logger.LogInformation($"Zaktualizowano preferencje dla użytkownika {userId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas aktualizacji preferencji dla użytkownika {userId}");
                return false;
            }
        }

        public async Task<bool> ShouldSendEmailNotificationAsync(string userId, string notificationType)
        {
            try
            {
                var preferences = await GetUserPreferencesAsync(userId);
                
                return notificationType.ToLower() switch
                {
                    "statuschange" => preferences.EmailNotifications.StatusChange,
                    "newreservation" => preferences.EmailNotifications.NewReservations,
                    _ => false
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas sprawdzania preferencji email dla użytkownika {userId}, typ: {notificationType}");
                return false; // Bezpieczne domyślne zachowanie - nie wysyłaj email
            }
        }

        public async Task<string> GetUserThemeAsync(string userId)
        {
            try
            {
                var preferences = await GetUserPreferencesAsync(userId);
                return preferences.Theme;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas pobierania theme dla użytkownika {userId}");
                return "normal"; // Domyślny theme
            }
        }
    }
}