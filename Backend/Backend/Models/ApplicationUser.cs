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

        public string? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }

        public ICollection<Rezerwacja> Rezerwacje { get; set; } = new List<Rezerwacja>();
        public ICollection<Powiadomienie> Powiadomienia { get; set; } = new List<Powiadomienie>();
    }
}
