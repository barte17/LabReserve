using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RezerwacjaController : Controller
    {
        private readonly AppDbContext _context;

        public RezerwacjaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<RezerwacjaDetailsDto>>> GetAll()
        {
            var rezerwacje = await _context.Rezerwacje
                .Include(r => r.Sala)
                .Include(r => r.Stanowisko)
                .Include(r => r.Uzytkownik)
                .Select(r => new RezerwacjaDetailsDto
                {
                    Id = r.Id,
                    SalaId = r.SalaId,
                    SalaNumer = r.Sala != null ? r.Sala.Numer.ToString() : null,
                    SalaBudynek = r.Sala != null ? r.Sala.Budynek : null,
                    StanowiskoId = r.StanowiskoId,
                    StanowiskoNazwa = r.Stanowisko != null ? r.Stanowisko.Nazwa : null,
                    UzytkownikId = r.UzytkownikId,
                    UzytkownikImie = r.Uzytkownik.Imie,
                    UzytkownikNazwisko = r.Uzytkownik.Nazwisko,
                    DataUtworzenia = r.DataUtworzenia,
                    DataStart = r.DataStart,
                    DataKoniec = r.DataKoniec,
                    Status = r.Status,
                    Opis = r.Opis
                })
                .OrderByDescending(r => r.DataUtworzenia)
                .ToListAsync();

            return Ok(rezerwacje);
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<RezerwacjaDetailsDto>>> GetMyReservations()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var rezerwacje = await _context.Rezerwacje
                .Include(r => r.Sala)
                .Include(r => r.Stanowisko)
                .Where(r => r.UzytkownikId == userId)
                .Select(r => new RezerwacjaDetailsDto
                {
                    Id = r.Id,
                    SalaId = r.SalaId,
                    SalaNumer = r.Sala != null ? r.Sala.Numer.ToString() : null,
                    SalaBudynek = r.Sala != null ? r.Sala.Budynek : null,
                    StanowiskoId = r.StanowiskoId,
                    StanowiskoNazwa = r.Stanowisko != null ? r.Stanowisko.Nazwa : null,
                    UzytkownikId = r.UzytkownikId,
                    DataUtworzenia = r.DataUtworzenia,
                    DataStart = r.DataStart,
                    DataKoniec = r.DataKoniec,
                    Status = r.Status,
                    Opis = r.Opis
                })
                .OrderByDescending(r => r.DataUtworzenia)
                .ToListAsync();

            return Ok(rezerwacje);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateRezerwacjaDto dto)
        {
            //do debugowania - sprawdzanie w konsoli
            Console.WriteLine($"=== CREATE RESERVATION ===");
            Console.WriteLine($"SalaId: {dto.SalaId}, StanowiskoId: {dto.StanowiskoId}");
            Console.WriteLine($"DataStart otrzymana: {dto.DataStart} (Kind: {dto.DataStart.Kind})");
            Console.WriteLine($"DataKoniec otrzymana: {dto.DataKoniec} (Kind: {dto.DataKoniec.Kind})");
            Console.WriteLine($"Current Local: {DateTime.Now}");
            Console.WriteLine($"Current UTC: {DateTime.UtcNow}");
            
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Walidacja - musi być podana sala lub stanowisko, ale nie oba
            if ((dto.SalaId == null && dto.StanowiskoId == null) || 
                (dto.SalaId != null && dto.StanowiskoId != null))
            {
                return BadRequest("Należy podać albo SalaId albo StanowiskoId, ale nie oba.");
            }

            // Walidacja czasu - rezerwacja musi być na pełne godziny
            if (dto.DataStart.Minute != 0 || dto.DataStart.Second != 0 ||
                dto.DataKoniec.Minute != 0 || dto.DataKoniec.Second != 0)
            {
                return BadRequest("Rezerwacje możliwe tylko na pełne godziny.");
            }

            // Walidacja - rezerwacja musi być w przyszłości
            var nowUnspecified = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
            if (dto.DataStart <= nowUnspecified)
            {
                return BadRequest("Nie można rezerwować w przeszłości.");
            }

            // Walidacja - koniec po początku
            if (dto.DataKoniec <= dto.DataStart)
            {
                return BadRequest("Data końca musi być późniejsza niż data początku.");
            }

            // Sprawdzenie dostępności - konwertuj daty na Unspecified
            var startUnspecified = DateTime.SpecifyKind(dto.DataStart, DateTimeKind.Unspecified);
            var endUnspecified = DateTime.SpecifyKind(dto.DataKoniec, DateTimeKind.Unspecified);
            
            var isAvailable = await CheckAvailability(dto.SalaId, dto.StanowiskoId, startUnspecified, endUnspecified);
            if (!isAvailable)
            {
                return BadRequest("Termin jest już zajęty.");
            }

            // TYMCZASOWO: Wyłącz sprawdzenie godzin otwarcia dla debugowania
            /*
            // Sprawdzenie godzin otwarcia
            if (dto.SalaId.HasValue)
            {
                var sala = await _context.Sale.FindAsync(dto.SalaId.Value);
                if (sala == null)
                    return BadRequest("Sala nie istnieje.");

                if (!IsWithinOpeningHours(sala, dto.DataStart, dto.DataKoniec))
                {
                    return BadRequest("Rezerwacja poza godzinami otwarcia sali.");
                }
            }
            else if (dto.StanowiskoId.HasValue)
            {
                var stanowisko = await _context.Stanowiska
                    .Include(s => s.Sala)
                    .FirstOrDefaultAsync(s => s.Id == dto.StanowiskoId.Value);
                
                if (stanowisko == null)
                    return BadRequest("Stanowisko nie istnieje.");

                if (!IsWithinOpeningHours(stanowisko.Sala, dto.DataStart, dto.DataKoniec))
                {
                    return BadRequest("Rezerwacja poza godzinami otwarcia sali.");
                }
            }
            */

            var rezerwacja = new Rezerwacja
            {
                SalaId = dto.SalaId,
                StanowiskoId = dto.StanowiskoId,
                UzytkownikId = userId,
                DataStart = DateTime.SpecifyKind(dto.DataStart, DateTimeKind.Unspecified), // Unspecified dla PostgreSQL
                DataKoniec = DateTime.SpecifyKind(dto.DataKoniec, DateTimeKind.Unspecified), // Unspecified dla PostgreSQL
                Opis = dto.Opis,
                Status = "oczekujące",
                DataUtworzenia = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified) // Unspecified dla PostgreSQL
            };

            _context.Rezerwacje.Add(rezerwacja);
            await _context.SaveChangesAsync();

            // Zwróć tylko podstawowe dane bez cyklicznych referencji
            var result = new RezerwacjaDetailsDto
            {
                Id = rezerwacja.Id,
                SalaId = rezerwacja.SalaId,
                StanowiskoId = rezerwacja.StanowiskoId,
                UzytkownikId = rezerwacja.UzytkownikId,
                DataUtworzenia = rezerwacja.DataUtworzenia,
                DataStart = rezerwacja.DataStart,
                DataKoniec = rezerwacja.DataKoniec,
                Status = rezerwacja.Status,
                Opis = rezerwacja.Opis
            };

            return CreatedAtAction(nameof(GetById), new { id = rezerwacja.Id }, result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<RezerwacjaDetailsDto>> GetById(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            var rezerwacja = await _context.Rezerwacje
                .Include(r => r.Sala)
                .Include(r => r.Stanowisko)
                .Include(r => r.Uzytkownik)
                .Where(r => r.Id == id && (isAdmin || r.UzytkownikId == userId))
                .Select(r => new RezerwacjaDetailsDto
                {
                    Id = r.Id,
                    SalaId = r.SalaId,
                    SalaNumer = r.Sala != null ? r.Sala.Numer.ToString() : null,
                    SalaBudynek = r.Sala != null ? r.Sala.Budynek : null,
                    StanowiskoId = r.StanowiskoId,
                    StanowiskoNazwa = r.Stanowisko != null ? r.Stanowisko.Nazwa : null,
                    UzytkownikId = r.UzytkownikId,
                    UzytkownikImie = r.Uzytkownik.Imie,
                    UzytkownikNazwisko = r.Uzytkownik.Nazwisko,
                    DataUtworzenia = r.DataUtworzenia,
                    DataStart = r.DataStart,
                    DataKoniec = r.DataKoniec,
                    Status = r.Status,
                    Opis = r.Opis
                })
                .FirstOrDefaultAsync();

            if (rezerwacja == null)
                return NotFound();

            return Ok(rezerwacja);
        }

        [HttpGet("available-days")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AvailableDayDto>>> GetAvailableDays([FromQuery] MonthAvailabilityDto dto)
        {
            try
            {
                if ((dto.SalaId == null && dto.StanowiskoId == null) || 
                    (dto.SalaId != null && dto.StanowiskoId != null))
                {
                    return BadRequest("Należy podać albo SalaId albo StanowiskoId, ale nie oba.");
                }

                // Walidacja parametrów
                if (dto.Year < 2020 || dto.Year > 2030 || dto.Month < 1 || dto.Month > 12)
                {
                    return BadRequest("Nieprawidłowy rok lub miesiąc.");
                }

                var startOfMonth = new DateTime(dto.Year, dto.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
                
                var availableDays = new List<AvailableDayDto>();
                
                for (var date = startOfMonth; date <= endOfMonth; date = date.AddDays(1))
                {
                    // Pozwól na rezerwacje w weekendy
                    var isPast = date.Date < DateTime.Now.Date; // Użyj DateTime.Now zamiast UtcNow
                    
                    var hasAvailableHours = false;
                    if (!isPast)
                    {
                        try
                        {
                            // Sprawdź czy są dostępne godziny w tym dniu
                            hasAvailableHours = await CheckDayAvailability(dto.SalaId, dto.StanowiskoId, date);
                        }
                        catch (Exception ex)
                        {
                            // Loguj błąd ale kontynuuj dla innych dni
                            Console.WriteLine($"Błąd sprawdzania dostępności dla {date:yyyy-MM-dd}: {ex.Message}");
                            hasAvailableHours = false;
                        }
                    }
                    
                    availableDays.Add(new AvailableDayDto
                    {
                        Data = date,
                        MaDostepneGodziny = hasAvailableHours
                    });
                }

                return Ok(availableDays);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Błąd w GetAvailableDays: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, "Błąd serwera podczas pobierania dostępnych dni.");
            }
        }

        [HttpGet("available-hours")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AvailableHoursDto>>> GetAvailableHours([FromQuery] AvailabilityCheckDto dto)
        {
            if ((dto.SalaId == null && dto.StanowiskoId == null) || 
                (dto.SalaId != null && dto.StanowiskoId != null))
            {
                return BadRequest("Należy podać albo SalaId albo StanowiskoId, ale nie oba.");
            }

            Sala? sala = null;
            if (dto.SalaId.HasValue)
            {
                sala = await _context.Sale.FindAsync(dto.SalaId.Value);
                if (sala == null)
                    return BadRequest("Sala nie istnieje.");
            }
            else if (dto.StanowiskoId.HasValue)
            {
                var stanowisko = await _context.Stanowiska
                    .Include(s => s.Sala)
                    .FirstOrDefaultAsync(s => s.Id == dto.StanowiskoId.Value);
                
                if (stanowisko == null)
                    return BadRequest("Stanowisko nie istnieje.");
                
                sala = stanowisko.Sala;
            }

            var availableHours = new List<AvailableHoursDto>();
            var startHour = sala?.CzynnaOd?.Hours ?? 8;
            var endHour = sala?.CzynnaDo?.Hours ?? 20;

            // dodanie też godziny zakończenia jako możliwą godzinę zakończenia
            for (int hour = startHour; hour <= endHour; hour++) // <= zamiast < żeby uwzględnić godzinę zamknięcia
            {
                var startTime = dto.Data.Date.AddHours(hour);
                var endTime = startTime.AddHours(1);

                // Konwertuj na Unspecified przed sprawdzaniem dostępności
                var startTimeUnspecified = DateTime.SpecifyKind(startTime, DateTimeKind.Unspecified);
                var endTimeUnspecified = DateTime.SpecifyKind(endTime, DateTimeKind.Unspecified);

                var isAvailable = await CheckAvailability(dto.SalaId, dto.StanowiskoId, startTimeUnspecified, endTimeUnspecified);
                
                // Sprawdź czy godzina jest w przeszłości - porównaj tylko jeśli to dzisiaj
                var isPast = false;
                if (startTime.Date == DateTime.Now.Date)
                {
                    // Jeśli to dzisiaj, sprawdź czy godzina już minęła
                    isPast = startTime <= DateTime.Now;
                }
                else if (startTime.Date < DateTime.Now.Date)
                {
                    // Jeśli to wczoraj lub wcześniej
                    isPast = true;
                }

                Console.WriteLine($"Godzina {hour}: startTime={startTime:yyyy-MM-dd HH:mm}, endTime={endTime:yyyy-MM-dd HH:mm}, isAvailable={isAvailable}, isPast={isPast}, DateTime.Now={DateTime.Now:yyyy-MM-dd HH:mm}");

                availableHours.Add(new AvailableHoursDto
                {
                    Godzina = TimeSpan.FromHours(hour),
                    Dostepna = isAvailable && !isPast
                });
            }

            return Ok(availableHours);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var rezerwacja = await _context.Rezerwacje.FindAsync(id);
            if (rezerwacja == null)
                return NotFound();

            rezerwacja.Status = dto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var isAdmin = User.IsInRole("Admin");

            var rezerwacja = await _context.Rezerwacje
                .FirstOrDefaultAsync(r => r.Id == id && (isAdmin || r.UzytkownikId == userId));

            if (rezerwacja == null)
                return NotFound();

            // Sprawdź czy można anulować (np. nie można anulować rezerwacji która już się rozpoczęła)
            var nowUnspecified = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
            if (rezerwacja.DataStart <= nowUnspecified && !isAdmin)
            {
                return BadRequest("Nie można anulować rezerwacji która już się rozpoczęła.");
            }

            _context.Rezerwacje.Remove(rezerwacja);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> CheckAvailability(int? salaId, int? stanowiskoId, DateTime start, DateTime end)
        {
            Console.WriteLine($"=== CheckAvailability ===");
            Console.WriteLine($"SalaId: {salaId}, StanowiskoId: {stanowiskoId}");
            Console.WriteLine($"Sprawdzam okres: {start:yyyy-MM-dd HH:mm} - {end:yyyy-MM-dd HH:mm}");

            // Konwertuj daty na Unspecified przed zapytaniem do bazy
            var startUnspecified = DateTime.SpecifyKind(start, DateTimeKind.Unspecified);
            var endUnspecified = DateTime.SpecifyKind(end, DateTimeKind.Unspecified);
            
            var allConflicts = await _context.Rezerwacje
                .Where(r => r.Status != "anulowane" && r.DataStart < endUnspecified && r.DataKoniec > startUnspecified)
                .ToListAsync();

            Console.WriteLine($"Zapytanie: DataStart < {endUnspecified:yyyy-MM-dd HH:mm} AND DataKoniec > {startUnspecified:yyyy-MM-dd HH:mm}");

            Console.WriteLine($"Wszystkie konflikty w okresie: {allConflicts.Count}");
            foreach (var conflict in allConflicts)
            {
                Console.WriteLine($"  - ID: {conflict.Id}, SalaId: {conflict.SalaId}, StanowiskoId: {conflict.StanowiskoId}, {conflict.DataStart:yyyy-MM-dd HH:mm}-{conflict.DataKoniec:yyyy-MM-dd HH:mm}");
            }

            if (salaId.HasValue)
            {
                // Sprawdź konflikty dla sali
                var salaConflicts = allConflicts.Where(r => r.SalaId == salaId.Value).ToList();
                Console.WriteLine($"Konflikty sali {salaId}: {salaConflicts.Count}");

                if (salaConflicts.Any()) 
                {
                    Console.WriteLine($"❌ Sala {salaId} zajęta przez rezerwacje sal");
                    return false;
                }
                
                // Sprawdź też czy nie ma rezerwacji stanowisk w tej sali
                var stanowiskaWsali = await _context.Stanowiska
                    .Where(s => s.SalaId == salaId.Value)
                    .Select(s => s.Id)
                    .ToListAsync();
                
                Console.WriteLine($"Stanowiska w sali {salaId}: [{string.Join(", ", stanowiskaWsali)}]");

                var stanowiskaConflicts = allConflicts
                    .Where(r => r.StanowiskoId.HasValue && stanowiskaWsali.Contains(r.StanowiskoId.Value))
                    .ToList();

                Console.WriteLine($"Konflikty stanowisk w sali {salaId}: {stanowiskaConflicts.Count}");

                if (stanowiskaConflicts.Any())
                {
                    Console.WriteLine($"❌ Sala {salaId} zajęta przez rezerwacje stanowisk");
                    return false;
                }

                Console.WriteLine($"✅ Sala {salaId} dostępna");
                return true;
            }
            else if (stanowiskoId.HasValue)
            {
                // Sprawdź konflikty dla stanowiska
                var stanowiskoConflicts = allConflicts.Where(r => r.StanowiskoId == stanowiskoId.Value).ToList();
                Console.WriteLine($"Konflikty stanowiska {stanowiskoId}: {stanowiskoConflicts.Count}");

                if (stanowiskoConflicts.Any())
                {
                    Console.WriteLine($"❌ Stanowisko {stanowiskoId} zajęte przez rezerwacje stanowiska");
                    return false;
                }
                
                // Sprawdź też czy nie ma rezerwacji całej sali
                var stanowisko = await _context.Stanowiska.FindAsync(stanowiskoId.Value);
                if (stanowisko != null)
                {
                    var salaConflicts = allConflicts.Where(r => r.SalaId == stanowisko.SalaId).ToList();
                    Console.WriteLine($"Konflikty sali {stanowisko.SalaId} dla stanowiska {stanowiskoId}: {salaConflicts.Count}");

                    if (salaConflicts.Any())
                    {
                        Console.WriteLine($"❌ Stanowisko {stanowiskoId} zajęte przez rezerwacje sali");
                        return false;
                    }
                }

                Console.WriteLine($"✅ Stanowisko {stanowiskoId} dostępne");
                return true;
            }

            Console.WriteLine("❌ Brak salaId ani stanowiskoId");
            return false;
        }

        private async Task<bool> CheckDayAvailability(int? salaId, int? stanowiskoId, DateTime date)
        {
            // TYMCZASOWO: Uproszczona logika bez sprawdzania godzin otwarcia
            Console.WriteLine($"=== CheckDayAvailability dla salaId: {salaId}, stanowiskoId: {stanowiskoId}, data: {date:yyyy-MM-dd} ===");
            
            Sala? sala = null;
            if (salaId.HasValue)
            {
                sala = await _context.Sale.FindAsync(salaId.Value);
                Console.WriteLine($"Znaleziono salę: {sala?.Numer} (ID: {sala?.Id})");
            }
            else if (stanowiskoId.HasValue)
            {
                var stanowisko = await _context.Stanowiska
                    .Include(s => s.Sala)
                    .FirstOrDefaultAsync(s => s.Id == stanowiskoId.Value);
                sala = stanowisko?.Sala;
                Console.WriteLine($"Znaleziono stanowisko w sali: {sala?.Numer}");
            }

            if (sala == null) 
            {
                Console.WriteLine($"❌ Sala nie znaleziona!");
                return false;
            }

            // Sprawdź czy dzień nie jest w przeszłości
            if (date.Date < DateTime.Now.Date) // DateTime.Now zamiast UtcNow
            {
                Console.WriteLine($"❌ Data {date:yyyy-MM-dd} jest w przeszłości");
                return false;
            }

            // TYMCZASOWO: Sprawdź tylko kilka standardowych godzin bez ograniczeń sal
            var hoursToCheck = new[] { 9, 10, 11, 14, 15, 16, 17 };
            Console.WriteLine($"Sprawdzam godziny: {string.Join(", ", hoursToCheck)}");
            
            foreach (int hour in hoursToCheck)
            {
                var startTime = date.Date.AddHours(hour);
                var endTime = startTime.AddHours(1);

                // Sprawdź czy nie jest w przeszłości
                if (startTime <= DateTime.Now)
                {
                    Console.WriteLine($"Godzina {hour}: pomijam - w przeszłości");
                    continue;
                }

                // Konwertuj na Unspecified przed sprawdzaniem dostępności
                var startTimeUnspecified = DateTime.SpecifyKind(startTime, DateTimeKind.Unspecified);
                var endTimeUnspecified = DateTime.SpecifyKind(endTime, DateTimeKind.Unspecified);

                var isAvailable = await CheckAvailability(salaId, stanowiskoId, startTimeUnspecified, endTimeUnspecified);
                Console.WriteLine($"Godzina {hour}: dostępna = {isAvailable}");
                
                if (isAvailable) 
                {
                    Console.WriteLine($"✅ Znaleziono dostępną godzinę {hour} dla dnia {date:yyyy-MM-dd}");
                    return true;
                }
            }

            Console.WriteLine($"❌ Brak dostępnych godzin dla dnia {date:yyyy-MM-dd}");
            return false;
        }

        private bool IsWithinOpeningHours(Sala sala, DateTime start, DateTime end)
        {
            if (sala.CzynnaOd == null || sala.CzynnaDo == null)
                return true; // Brak ograniczeń godzinowych

            var startTime = start.TimeOfDay;
            var endTime = end.TimeOfDay;

            return startTime >= sala.CzynnaOd && endTime <= sala.CzynnaDo;
        }
    }
}
