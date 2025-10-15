using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Encodings.Web;

namespace Backend.Services
{
    public class PowiadomieniaService : IPowiadomieniaService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PowiadomieniaService> _logger;

        public PowiadomieniaService(AppDbContext context, ILogger<PowiadomieniaService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> WyslijPowiadomienieAsync(string uzytkownikId, string tytul, 
            string tresc, string typ, string priorytet = "normal", int? rezerwacjaId = null, string? actionUrl = null)
        {
            try
            {
                // Walidacja danych wejściowych
                if (string.IsNullOrWhiteSpace(uzytkownikId) || string.IsNullOrWhiteSpace(tytul) || 
                    string.IsNullOrWhiteSpace(tresc))
                {
                    _logger.LogWarning("Próba wysłania powiadomienia z niepełnymi danymi");
                    return false;
                }

                // Sanityzacja danych wejściowych (XSS protection)
                var sanitizedTytul = HtmlEncoder.Default.Encode(tytul.Trim());
                var sanitizedTresc = HtmlEncoder.Default.Encode(tresc.Trim());
                var sanitizedActionUrl = actionUrl != null ? HtmlEncoder.Default.Encode(actionUrl.Trim()) : null;

                // Ograniczenie długości
                if (sanitizedTytul.Length > 100) sanitizedTytul = sanitizedTytul.Substring(0, 100);
                if (sanitizedTresc.Length > 500) sanitizedTresc = sanitizedTresc.Substring(0, 500);
                if (sanitizedActionUrl != null && sanitizedActionUrl.Length > 200) 
                    sanitizedActionUrl = sanitizedActionUrl.Substring(0, 200);

                // Walidacja typu i priorytetu
                var dozwoloneTypy = new[] { "rezerwacja", "system", "reminder" };
                var dozwolonePriorytety = new[] { "low", "normal", "high" };
                
                if (!dozwoloneTypy.Contains(typ))
                {
                    _logger.LogWarning($"Nieprawidłowy typ powiadomienia: {typ}");
                    return false;
                }

                if (!dozwolonePriorytety.Contains(priorytet))
                {
                    _logger.LogWarning($"Nieprawidłowy priorytet powiadomienia: {priorytet}");
                    priorytet = "normal";
                }

                // Sprawdź czy użytkownik istnieje
                var uzytkownikExists = await _context.Users.AnyAsync(u => u.Id == uzytkownikId);
                if (!uzytkownikExists)
                {
                    _logger.LogWarning($"Próba wysłania powiadomienia do nieistniejącego użytkownika: {uzytkownikId}");
                    return false;
                }

                // Sprawdź czy rezerwacja istnieje (jeśli podana)
                if (rezerwacjaId.HasValue)
                {
                    var rezerwacjaExists = await _context.Rezerwacje.AnyAsync(r => r.Id == rezerwacjaId.Value);
                    if (!rezerwacjaExists)
                    {
                        _logger.LogWarning($"Próba powiązania powiadomienia z nieistniejącą rezerwacją: {rezerwacjaId}");
                        rezerwacjaId = null; // Nie blokuj wysyłania, tylko usuń nieprawidłowe powiązanie
                    }
                }

                // Utwórz powiadomienie
                var powiadomienie = new Powiadomienie
                {
                    UzytkownikId = uzytkownikId,
                    Tytul = sanitizedTytul,
                    Tresc = sanitizedTresc,
                    Typ = typ,
                    Priorytet = priorytet,
                    RezerwacjaId = rezerwacjaId,
                    ActionUrl = sanitizedActionUrl,
                    DataUtworzenia = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                    DataWygasniecia = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(30), DateTimeKind.Unspecified) // 30 dni ważności
                };

                _context.Powiadomienia.Add(powiadomienie);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Wysłano powiadomienie ID: {powiadomienie.Id} do użytkownika: {uzytkownikId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas wysyłania powiadomienia dla użytkownika {uzytkownikId}");
                return false;
            }
        }

        public async Task<List<Powiadomienie>> PobierzPowiadomieniaAsync(string uzytkownikId, int strona = 1, int rozmiar = 20)
        {
            try
            {
                // Walidacja parametrów
                if (string.IsNullOrWhiteSpace(uzytkownikId))
                {
                    _logger.LogWarning("Próba pobrania powiadomień bez ID użytkownika");
                    return new List<Powiadomienie>();
                }

                if (strona < 1) strona = 1;
                if (rozmiar < 1 || rozmiar > 100) rozmiar = 20; // Max 100 dla bezpieczeństwa

                var teraz = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                
                return await _context.Powiadomienia
                    .Where(p => p.UzytkownikId == uzytkownikId && 
                               (p.DataWygasniecia == null || p.DataWygasniecia > teraz))
                    .OrderByDescending(p => p.DataUtworzenia)
                    .Skip((strona - 1) * rozmiar)
                    .Take(rozmiar)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas pobierania powiadomień dla użytkownika {uzytkownikId}");
                return new List<Powiadomienie>();
            }
        }

        public async Task<bool> OznaczJakoPrzeczytaneAsync(int powiadomienieId, string uzytkownikId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(uzytkownikId))
                {
                    _logger.LogWarning("Próba oznaczenia powiadomienia jako przeczytane bez ID użytkownika");
                    return false;
                }

                var powiadomienie = await _context.Powiadomienia
                    .FirstOrDefaultAsync(p => p.Id == powiadomienieId && p.UzytkownikId == uzytkownikId);

                if (powiadomienie == null)
                {
                    _logger.LogWarning($"Powiadomienie {powiadomienieId} nie znalezione dla użytkownika {uzytkownikId}");
                    return false;
                }

                if (!powiadomienie.CzyPrzeczytane)
                {
                    powiadomienie.CzyPrzeczytane = true;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Oznaczono powiadomienie {powiadomienieId} jako przeczytane");
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas oznaczania powiadomienia {powiadomienieId} jako przeczytane");
                return false;
            }
        }

        public async Task<int> PobierzLiczbaNieprzeczytanychAsync(string uzytkownikId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(uzytkownikId))
                {
                    return 0;
                }

                var teraz = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                
                return await _context.Powiadomienia
                    .CountAsync(p => p.UzytkownikId == uzytkownikId && 
                               !p.CzyPrzeczytane &&
                               (p.DataWygasniecia == null || p.DataWygasniecia > teraz));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas pobierania liczby nieprzeczytanych powiadomień dla użytkownika {uzytkownikId}");
                return 0;
            }
        }

        public async Task<bool> UsunPowiadomienieAsync(int powiadomienieId, string uzytkownikId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(uzytkownikId))
                {
                    _logger.LogWarning("Próba usunięcia powiadomienia bez ID użytkownika");
                    return false;
                }

                var powiadomienie = await _context.Powiadomienia
                    .FirstOrDefaultAsync(p => p.Id == powiadomienieId && p.UzytkownikId == uzytkownikId);

                if (powiadomienie == null)
                {
                    _logger.LogWarning($"Powiadomienie {powiadomienieId} nie znalezione dla użytkownika {uzytkownikId}");
                    return false;
                }

                _context.Powiadomienia.Remove(powiadomienie);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Usunięto powiadomienie {powiadomienieId} dla użytkownika {uzytkownikId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas usuwania powiadomienia {powiadomienieId}");
                return false;
            }
        }

        public async Task<int> UsunWszystkiePowiadomieniaAsync(string uzytkownikId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(uzytkownikId))
                {
                    _logger.LogWarning("Próba usunięcia wszystkich powiadomień bez ID użytkownika");
                    return 0;
                }

                // Zabezpieczenie: sprawdź czy użytkownik istnieje
                var uzytkownikExists = await _context.Users.AnyAsync(u => u.Id == uzytkownikId);
                if (!uzytkownikExists)
                {
                    _logger.LogWarning($"Próba usunięcia powiadomień dla nieistniejącego użytkownika: {uzytkownikId}");
                    return 0;
                }

                // Pobierz wszystkie powiadomienia użytkownika (włącznie z wygasłymi dla kompletnego oczyszczenia)
                var powiadomieniaDoUsuniecia = await _context.Powiadomienia
                    .Where(p => p.UzytkownikId == uzytkownikId)
                    .ToListAsync();

                if (!powiadomieniaDoUsuniecia.Any())
                {
                    _logger.LogInformation($"Brak powiadomień do usunięcia dla użytkownika {uzytkownikId}");
                    return 0;
                }

                var liczbaUsunietych = powiadomieniaDoUsuniecia.Count;
                
                // Usuń wszystkie powiadomienia w jednej operacji dla wydajności
                _context.Powiadomienia.RemoveRange(powiadomieniaDoUsuniecia);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Usunięto {liczbaUsunietych} powiadomień dla użytkownika {uzytkownikId}");
                return liczbaUsunietych;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas usuwania wszystkich powiadomień dla użytkownika {uzytkownikId}");
                return 0;
            }
        }

        public async Task UsunWygasleAsync()
        {
            try
            {
                var teraz = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
                
                var wygasle = await _context.Powiadomienia
                    .Where(p => p.DataWygasniecia.HasValue && p.DataWygasniecia < teraz)
                    .ToListAsync();

                if (wygasle.Any())
                {
                    _context.Powiadomienia.RemoveRange(wygasle);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Usunięto {wygasle.Count} wygasłych powiadomień");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas usuwania wygasłych powiadomień");
            }
        }
    }
}