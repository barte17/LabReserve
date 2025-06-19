using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Zdjecie
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(255)]
        public string Url { get; set; } = null!;

        public int? SalaId { get; set; }
        [ForeignKey(nameof(SalaId))]
        public Sala? Sala { get; set; }

        public int? StanowiskoId { get; set; }
        [ForeignKey(nameof(StanowiskoId))]
        public Stanowisko? Stanowisko { get; set; }
    }
}
