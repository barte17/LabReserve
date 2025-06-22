namespace Backend.Dto
{
    public class RezerwacjaDto
    {
        public int Id { get; set; }
        public int? SalaId { get; set; }
        public int? StanowiskoId { get; set; }
        public string UzytkownikId { get; set; }
        public DateTime DataUtworzenia { get; set; }
        public DateTime DataStart { get; set; }
        public DateTime DataKoniec { get; set; }
        public string Status { get; set; }
        public string Opis { get; set; }
    }
}
