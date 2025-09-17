using System.ComponentModel.DataAnnotations;

namespace Backend.Dto
{
    public class UpdateMojeStanowiskoDto
    {
        [MaxLength(500)]
        public string? Opis { get; set; }
    }
}