namespace Backend.Dto
{
    public class StanowiskoDto
    {
        public int Id { get; set; }
        public int SalaId { get; set; }
        public string Nazwa { get; set; } = null!;
        public string? Typ { get; set; }
        public string? Opis { get; set; }
        public int SalaNumer { get; set; }
        public string SalaBudynek { get; set; } = null!;
        public string? PierwszeZdjecie { get; set; }
    }

    public class CreateStanowiskoDto
    {
        public int SalaId { get; set; }
        public string Nazwa { get; set; } = string.Empty;
        public string? Typ { get; set; }
        public string? Opis { get; set; }
    }
}
