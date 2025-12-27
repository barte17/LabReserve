using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required, MaxLength(50)]
        public string Imie { get; set; }

        [Required, MaxLength(50)]
        public string Nazwisko { get; set; }

        public string? RefreshTokenHash { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
        
        [MaxLength(2000)]
        public string Preferences { get; set; } = "{}"; // JSON string z preferencjami użytkownika

        public ICollection<Rezerwacja> Rezerwacje { get; set; } = new List<Rezerwacja>();
        public ICollection<Powiadomienie> Powiadomienia { get; set; } = new List<Powiadomienie>();
    }
}
