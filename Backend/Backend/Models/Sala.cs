using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Sala
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(5)]
        public int Numer { get; set; }

        [Required, MaxLength(40)]
        public string Budynek { get; set; }

        public int? MaxOsob { get; set; }

        public bool? MaStanowiska { get; set; }

        public TimeSpan? CzynnaOd { get; set; }
        public TimeSpan? CzynnaDo { get; set; }

        [MaxLength(500)]
        public string? Opis { get; set; }

        public string? IdOpiekuna { get; set; }
        [ForeignKey(nameof(IdOpiekuna))]
        public ApplicationUser? Opiekun { get; set; }

        public ICollection<Zdjecie> Zdjecia { get; set; } = new List<Zdjecie>();
        public ICollection<Rezerwacja> Rezerwacje { get; set; } = new List<Rezerwacja>();
    }
}
