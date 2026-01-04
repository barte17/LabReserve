using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Stanowisko
    {
        [Key]
        public int Id { get; set; }

        public int SalaId { get; set; }
        [ForeignKey(nameof(SalaId))]
        public Sala Sala { get; set; } = null!;

        [Required, MaxLength(80)]
        public string Nazwa { get; set; } = null!;

        [MaxLength(50)]
        public string? Typ { get; set; }

        [MaxLength(500)]
        public string? Opis { get; set; }

        public bool CzyAktywny { get; set; } = true;

        public ICollection<Zdjecie> Zdjecia { get; set; } = new List<Zdjecie>();
        public ICollection<Rezerwacja> Rezerwacje { get; set; } = new List<Rezerwacja>();
    }
}
