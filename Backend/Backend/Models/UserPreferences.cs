using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class UserPreferences
    {
        [JsonPropertyName("emailNotifications")]
        public EmailNotificationSettings EmailNotifications { get; set; } = new();

        [JsonPropertyName("theme")]
        public string Theme { get; set; } = "normal"; // "normal" lub "dark"

        public static UserPreferences GetDefault()
        {
            return new UserPreferences
            {
                EmailNotifications = new EmailNotificationSettings(),
                Theme = "normal"
            };
        }
    }

    public class EmailNotificationSettings
    {
        [JsonPropertyName("statusChange")]
        public bool StatusChange { get; set; } = false; // Powiadomienia email o zmianie statusu rezerwacji

        [JsonPropertyName("newReservations")]
        public bool NewReservations { get; set; } = false; // Powiadomienia email o nowych rezerwacjach (tylko dla opiekunów)
    }
}