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

            // Zwróć tylko podstawowe
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
                            hasAvailableHours = await CheckDayAvailability(dto.SalaId, dto.StanowiskoId, date);
                        }
                        catch
                        {
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
            catch
            {
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
            var startUnspecified = DateTime.SpecifyKind(start, DateTimeKind.Unspecified);
            var endUnspecified = DateTime.SpecifyKind(end, DateTimeKind.Unspecified);
            
            var allConflicts = await _context.Rezerwacje
                .Where(r => r.Status != "anulowane" && r.DataStart < endUnspecified && r.DataKoniec > startUnspecified)
                .ToListAsync();

            if (salaId.HasValue)
            {
                var salaConflicts = allConflicts.Where(r => r.SalaId == salaId.Value).ToList();

                if (salaConflicts.Any()) 
                {
                    return false;
                }
                
                var stanowiskaWsali = await _context.Stanowiska
                    .Where(s => s.SalaId == salaId.Value)
                    .Select(s => s.Id)
                    .ToListAsync();

                var stanowiskaConflicts = allConflicts
                    .Where(r => r.StanowiskoId.HasValue && stanowiskaWsali.Contains(r.StanowiskoId.Value))
                    .ToList();

                if (stanowiskaConflicts.Any())
                {
                    return false;
                }

                return true;
            }
            else if (stanowiskoId.HasValue)
            {
                var stanowiskoConflicts = allConflicts.Where(r => r.StanowiskoId == stanowiskoId.Value).ToList();

                if (stanowiskoConflicts.Any())
                {
                    return false;
                }
                
                var stanowisko = await _context.Stanowiska.FindAsync(stanowiskoId.Value);
                if (stanowisko != null)
                {
                    var salaConflicts = allConflicts.Where(r => r.SalaId == stanowisko.SalaId).ToList();

                    if (salaConflicts.Any())
                    {
                        return false;
                    }
                }

                return true;
            }

            return false;
        }

        private async Task<bool> CheckDayAvailability(int? salaId, int? stanowiskoId, DateTime date)
        {
            Sala? sala = null;
            if (salaId.HasValue)
            {
                sala = await _context.Sale.FindAsync(salaId.Value);
            }
            else if (stanowiskoId.HasValue)
            {
                var stanowisko = await _context.Stanowiska
                    .Include(s => s.Sala)
                    .FirstOrDefaultAsync(s => s.Id == stanowiskoId.Value);
                sala = stanowisko?.Sala;
            }

            if (sala == null) 
            {
                return false;
            }

            if (date.Date < DateTime.Now.Date)
            {
                return false;
            }

            var hoursToCheck = new[] { 9, 10, 11, 14, 15, 16, 17 };
            
            foreach (int hour in hoursToCheck)
            {
                var startTime = date.Date.AddHours(hour);
                var endTime = startTime.AddHours(1);

                if (startTime <= DateTime.Now)
                {
                    continue;
                }

                var startTimeUnspecified = DateTime.SpecifyKind(startTime, DateTimeKind.Unspecified);
                var endTimeUnspecified = DateTime.SpecifyKind(endTime, DateTimeKind.Unspecified);

                var isAvailable = await CheckAvailability(salaId, stanowiskoId, startTimeUnspecified, endTimeUnspecified);
                
                if (isAvailable) 
                {
                    return true;
                }
            }

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
