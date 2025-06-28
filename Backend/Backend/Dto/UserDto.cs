namespace Backend.Dto
{
    public class UserDto
    {
        public string Id { get; set; }
        public string Imie { get; set; } = string.Empty;
        public string Nazwisko { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
    }

}
