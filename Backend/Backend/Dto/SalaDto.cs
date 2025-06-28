namespace Backend.Dto
{
    public class SalaDto
    {
        public int Id { get; set; }
        public int Numer { get; set; }
        public string Budynek { get; set; }
        public int? MaxOsob { get; set; }
        public bool? MaStanowiska { get; set; }
        public TimeOnly? CzynnaOd { get; set; }
        public TimeOnly? CzynnaDo { get; set; }
        public string? Opis { get; set; }
        public string? IdOpiekuna { get; set; }
    }

}
