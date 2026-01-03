using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.Services;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PowiadomieniaController : ControllerBase
    {
        private readonly IPowiadomieniaService _powiadomieniaService;
        private readonly IRealTimePowiadomieniaService _realTimeService;
        private readonly ILogger<PowiadomieniaController> _logger;

        public PowiadomieniaController(
            IPowiadomieniaService powiadomieniaService,
            IRealTimePowiadomieniaService realTimeService,
            ILogger<PowiadomieniaController> logger)
        {
            _powiadomieniaService = powiadomieniaService;
            _realTimeService = realTimeService;
            _logger = logger;
        }

        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> PobierzPowiadomienia([FromQuery] int strona = 1, [FromQuery] int rozmiar = 10)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                // Walidacja parametrów
                if (strona < 1) strona = 1;
                if (rozmiar < 1 || rozmiar > 100) rozmiar = 10;

                var powiadomienia = await _powiadomieniaService.PobierzPowiadomieniaAsync(userId, strona, rozmiar);
                
                return Ok(new
                {
                    powiadomienia = powiadomienia.Select(p => new
                    {
                        id = p.Id,
                        tytul = p.Tytul,
                        tresc = p.Tresc,
                        typ = p.Typ,
                        priorytet = p.Priorytet,
                        czyPrzeczytane = p.CzyPrzeczytane,
                        dataUtworzenia = p.DataUtworzenia,
                        actionUrl = p.ActionUrl,
                        rezerwacjaId = p.RezerwacjaId
                    }),
                    strona,
                    rozmiar,
                    liczbaElementow = powiadomienia.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas pobierania powiadomień");
                return StatusCode(500, "Wystąpił błąd podczas pobierania powiadomień");
            }
        }

        [HttpPost("{id}/przeczytane")]
        public async Task<IActionResult> OznaczJakoPrzeczytane(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                var success = await _powiadomieniaService.OznaczJakoPrzeczytaneAsync(id, userId);
                
                if (!success)
                {
                    return NotFound("Powiadomienie nie zostało znalezione");
                }

                // SignalR już aktualizowany w Service - nie duplikuj wywołania

                return Ok(new { message = "Powiadomienie zostało oznaczone jako przeczytane" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas oznaczania powiadomienia {id} jako przeczytane");
                return StatusCode(500, "Wystąpił błąd podczas aktualizacji powiadomienia");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> UsunPowiadomienie(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                var success = await _powiadomieniaService.UsunPowiadomienieAsync(id, userId);
                
                if (!success)
                {
                    return NotFound("Powiadomienie nie zostało znalezione");
                }

                // SignalR już aktualizowany w Service - nie duplikuj wywołania

                return Ok(new { message = "Powiadomienie zostało usunięte" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas usuwania powiadomienia {id}");
                return StatusCode(500, "Wystąpił błąd podczas usuwania powiadomienia");
            }
        }

        [HttpGet("licznik")]
        public async Task<IActionResult> PobierzLicznikNieprzeczytanych()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                var liczba = await _powiadomieniaService.PobierzLiczbaNieprzeczytanychAsync(userId);
                
                return Ok(new { licznik = liczba });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas pobierania licznika nieprzeczytanych powiadomień");
                return StatusCode(500, "Wystąpił błąd podczas pobierania licznika");
            }
        }

        [HttpPost("oznacz-wszystkie-przeczytane")]
        public async Task<IActionResult> OznaczWszystkieJakoPrzeczytane()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                // Użyj nowej metody bulk update - wydajniejsza i bez limitu 1000
                var liczbaOznaczonych = await _powiadomieniaService.OznaczWszystkieJakoPrzeczytaneAsync(userId);

                // SignalR już aktualizowany w Service - nie duplikuj wywołania

                return Ok(new { message = $"Oznaczono {liczbaOznaczonych} powiadomień jako przeczytane" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas oznaczania wszystkich powiadomień jako przeczytane");
                return StatusCode(500, "Wystąpił błąd podczas aktualizacji powiadomień");
            }
        }

        [HttpDelete("usun-wszystkie")]
        public async Task<IActionResult> UsunWszystkiePowiadomienia()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                var liczbaUsunietych = await _powiadomieniaService.UsunWszystkiePowiadomieniaAsync(userId);
                
                if (liczbaUsunietych == 0)
                {
                    return Ok(new { 
                        message = "Brak powiadomień do usunięcia",
                        liczbaUsunietych = 0
                    });
                }

                // SignalR już aktualizowany w Service - nie duplikuj wywołania

                return Ok(new { 
                    message = $"Usunięto {liczbaUsunietych} powiadomień",
                    liczbaUsunietych = liczbaUsunietych
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas usuwania wszystkich powiadomień");
                return StatusCode(500, "Wystąpił błąd podczas usuwania powiadomień");
            }
        }

        [HttpPost("test")]
        public async Task<IActionResult> WyslijTestowePowiadomienie()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                var success = await _powiadomieniaService.WyslijPowiadomienieAsync(
                    userId,
                    "Testowe powiadomienie",
                    "To jest testowe powiadomienie wysłane z systemu. Sprawdza działanie real-time i toast notifications.",
                    "system",
                    "normal",
                    null,
                    "/panel?view=user&section=powiadomienia"
                );

                if (success)
                {
                    // Pobierz najnowsze powiadomienie dla tego użytkownika (właśnie utworzone)
                    var najnowszePowiadomienia = await _powiadomieniaService.PobierzPowiadomieniaAsync(userId, 1, 1);
                    var nowePowiadomienie = najnowszePowiadomienia.FirstOrDefault();

                    if (nowePowiadomienie != null)
                    {
                        // Wyślij real-time powiadomienie z prawdziwym ID
                        await _realTimeService.WyslijRealTimePowiadomienieAsync(userId, new
                        {
                            id = nowePowiadomienie.Id,
                            tytul = nowePowiadomienie.Tytul,
                            tresc = nowePowiadomienie.Tresc,
                            typ = nowePowiadomienie.Typ,
                            priorytet = nowePowiadomienie.Priorytet,
                            czyPrzeczytane = nowePowiadomienie.CzyPrzeczytane,
                            dataUtworzenia = nowePowiadomienie.DataUtworzenia.ToString("yyyy-MM-ddTHH:mm:ss"),
                            actionUrl = nowePowiadomienie.ActionUrl
                        });
                    }

                    return Ok(new { message = "Testowe powiadomienie zostało wysłane!" });
                }
                else
                {
                    return StatusCode(500, "Nie udało się wysłać testowego powiadomienia");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas wysyłania testowego powiadomienia");
                return StatusCode(500, "Wystąpił błąd podczas wysyłania testowego powiadomienia");
            }
        }
    }
}