using System.ComponentModel.DataAnnotations;

namespace Backend.Dto
{
    public class UpdateMojaSalaDto
    {
        [MaxLength(500)]
        public string? Opis { get; set; }

        public TimeSpan? CzynnaOd { get; set; }

        public TimeSpan? CzynnaDo { get; set; }
    }
}