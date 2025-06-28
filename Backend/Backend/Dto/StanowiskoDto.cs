namespace Backend.Dto
{
    public class StanowiskoDto
    {
        public int Id { get; set; }

        public int SalaId { get; set; }

        public string Nazwa { get; set; } = null!;

        public string? Typ { get; set; }

        public string? Opis { get; set; }
    }
}
