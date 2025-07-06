using System.ComponentModel.DataAnnotations;

namespace Backend.Dto
{
    public class RegisterDto
    {

        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        [MaxLength(50)]
        public string Imie { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nazwisko { get; set; }

    }
}
