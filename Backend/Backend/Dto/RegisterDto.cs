using System.ComponentModel.DataAnnotations;
using Backend.Data.CustomDataValidations;

namespace Backend.Dto
{
    public class RegisterDto
    {

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StrongPassword]
        public string Password { get; set; }

        [Required]
        [MaxLength(50)]
        [OnlyLetters]
        public string Imie { get; set; }

        [Required]
        [MaxLength(50)]
        [OnlyLetters]
        public string Nazwisko { get; set; }

    }
}
