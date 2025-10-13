using Backend.Models;

namespace Backend.Services
{
    public interface IPowiadomieniaService
    {
        Task<bool> WyslijPowiadomienieAsync(string uzytkownikId, string tytul, string tresc, 
            string typ, string priorytet = "normal", int? rezerwacjaId = null, string? actionUrl = null);
        
        Task<List<Powiadomienie>> PobierzPowiadomieniaAsync(string uzytkownikId, int strona = 1, int rozmiar = 20);
        
        Task<bool> OznaczJakoPrzeczytaneAsync(int powiadomienieId, string uzytkownikId);
        
        Task<int> PobierzLiczbaNieprzeczytanychAsync(string uzytkownikId);
        
        Task<bool> UsunPowiadomienieAsync(int powiadomienieId, string uzytkownikId);
        
        Task UsunWygasleAsync();
    }
}