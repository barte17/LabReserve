using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Powiadomienie
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UzytkownikId { get; set; }
        [ForeignKey(nameof(UzytkownikId))]
        public ApplicationUser Uzytkownik { get; set; } = null!;

        [Required, MaxLength(100)]
        public string Tytul { get; set; } = null!;

        [Required, MaxLength(500)]
        public string Tresc { get; set; } = null!;

        [Required, MaxLength(20)]
        public string Typ { get; set; } = null!; // "rezerwacja", "system", "reminder"

        [Required, MaxLength(15)]
        public string Priorytet { get; set; } = "normal"; // "low", "normal", "high"

        public bool CzyPrzeczytane { get; set; } = false;
        
        public DateTime DataUtworzenia { get; set; } = DateTime.UtcNow;

        // Opcjonalne linki
        public int? RezerwacjaId { get; set; }
        [ForeignKey(nameof(RezerwacjaId))]
        public Rezerwacja? Rezerwacja { get; set; }

        [MaxLength(200)]
        public string? ActionUrl { get; set; }

        public DateTime? DataWygasniecia { get; set; }
    }
}