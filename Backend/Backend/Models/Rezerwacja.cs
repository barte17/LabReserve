using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Rezerwacja
    {
        [Key]
        public int Id { get; set; }

        public int? SalaId { get; set; }
        [ForeignKey(nameof(SalaId))]
        public Sala? Sala { get; set; }

        public int? StanowiskoId { get; set; }
        [ForeignKey(nameof(StanowiskoId))]
        public Stanowisko? Stanowisko { get; set; }

        public string UzytkownikId { get; set; }
        [ForeignKey(nameof(UzytkownikId))]
        public ApplicationUser Uzytkownik { get; set; } = null!;

        [Required]
        public DateTime DataStart { get; set; }

        [Required]
        public DateTime DataKoniec { get; set; }

        [MaxLength(60)]
        public string? Opis { get; set; }

        [Required, MaxLength(20)]
        public string Status { get; set; } = "oczekujące";

        public DateTime DataUtworzenia { get; set; }
    }
}
