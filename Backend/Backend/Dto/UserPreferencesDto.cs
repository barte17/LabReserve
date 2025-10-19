using System.ComponentModel.DataAnnotations;

namespace Backend.Dto
{
    public class UserPreferencesDto
    {
        public EmailNotificationSettingsDto EmailNotifications { get; set; } = new();
        
        [Required]
        [RegularExpression("^(normal|dark)$", ErrorMessage = "Theme musi być 'normal' lub 'dark'")]
        public string Theme { get; set; } = "normal";
    }

    public class EmailNotificationSettingsDto
    {
        public bool StatusChange { get; set; } = false;
        public bool NewReservations { get; set; } = false;
    }

    public class UpdatePreferencesDto
    {
        public EmailNotificationSettingsDto? EmailNotifications { get; set; }
        public string? Theme { get; set; }
    }
}