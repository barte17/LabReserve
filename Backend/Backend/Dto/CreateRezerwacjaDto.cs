namespace Backend.Dto
{
    public class CreateRezerwacjaDto
    {
        public int? SalaId { get; set; }
        public int? StanowiskoId { get; set; }
        public DateTime DataStart { get; set; }
        public DateTime DataKoniec { get; set; }
        public string? Opis { get; set; }
    }

    public class AvailabilityCheckDto
    {
        public int? SalaId { get; set; }
        public int? StanowiskoId { get; set; }
        public DateTime Data { get; set; }
    }

    public class AvailableHoursDto
    {
        public TimeSpan Godzina { get; set; }
        public bool Dostepna { get; set; }
    }

    public class RezerwacjaDetailsDto
    {
        public int Id { get; set; }
        public int? SalaId { get; set; }
        public string? SalaNumer { get; set; }
        public string? SalaBudynek { get; set; }
        public int? StanowiskoId { get; set; }
        public string? StanowiskoNazwa { get; set; }
        public string UzytkownikId { get; set; }
        public string? UzytkownikImie { get; set; }
        public string? UzytkownikNazwisko { get; set; }
        public DateTime DataUtworzenia { get; set; }
        public DateTime DataStart { get; set; }
        public DateTime DataKoniec { get; set; }
        public string Status { get; set; }
        public string? Opis { get; set; }
    }

    public class MonthAvailabilityDto
    {
        public int? SalaId { get; set; }
        public int? StanowiskoId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
    }

    public class AvailableDayDto
    {
        public DateTime Data { get; set; }
        public bool MaDostepneGodziny { get; set; }
    }
}