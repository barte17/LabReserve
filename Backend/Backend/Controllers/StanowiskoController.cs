using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StanowiskoController : Controller
    {
        private readonly AppDbContext _context;
        private readonly Backend.Services.IImageProcessingService _imageProcessingService;

        public StanowiskoController(AppDbContext context, Backend.Services.IImageProcessingService imageProcessingService)
        {
            _context = context;
            _imageProcessingService = imageProcessingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StanowiskoDto>>> GetAll()
        {
            var stanowiska = await _context.Stanowiska
                .Where(s => s.CzyAktywny)
                .Include(s => s.Sala)
                .Include(s => s.Zdjecia)
                .Select(s => new StanowiskoDto
                {
                    Id = s.Id,
                    SalaId = s.SalaId,
                    Nazwa = s.Nazwa,
                    Typ = s.Typ,
                    Opis = s.Opis,
                    SalaNumer = s.Sala.Numer,
                    SalaBudynek = s.Sala.Budynek,
                    PierwszeZdjecie = s.Zdjecia.OrderBy(z => z.Id).FirstOrDefault() != null ? s.Zdjecia.OrderBy(z => z.Id).FirstOrDefault()!.Url : null,
                    CzyAktywny = s.CzyAktywny
                })
                .ToListAsync();

            return Ok(stanowiska);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateStanowisko([FromForm] CreateStanowiskoDto dto, [FromForm] List<IFormFile>? zdjecia)
        {
            var stanowisko = new Stanowisko
            {
                SalaId = dto.SalaId,
                Nazwa = dto.Nazwa,
                Typ = dto.Typ,
                Opis = dto.Opis,
                CzyAktywny = dto.CzyAktywny
            };

            _context.Stanowiska.Add(stanowisko);
            await _context.SaveChangesAsync();

            // Obsługa zdjęć
            if (zdjecia != null && zdjecia.Count > 0)
            {
                await SaveZdjeciaForStanowisko(stanowisko.Id, zdjecia);
            }

            return CreatedAtAction(nameof(GetById), new { id = stanowisko.Id }, stanowisko);
        }

        private async Task SaveZdjeciaForStanowisko(int stanowiskoId, List<IFormFile> zdjecia)
        {
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "stanowiska", $"stanowisko-{stanowiskoId}");

            foreach (var (file, index) in zdjecia.Select((f, i) => (f, i)))
            {
                if (file.Length > 0 && _imageProcessingService.IsValidImageFile(file))
                {
                    try
                    {
                        // Generowanie unikalnej nazwy
                        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                        var fileName = $"{timestamp}_img-{index + 1}";

                        // Przetwarzanie i zapisanie obrazu (automatycznie jako WebP 1920x1080)
                        var processedFileName = await _imageProcessingService.ProcessAndSaveImageAsync(file, uploadsPath, fileName);

                        // Dodanie rekordu do bazy
                        var zdjecie = new Zdjecie
                        {
                            Url = $"/uploads/stanowiska/stanowisko-{stanowiskoId}/{processedFileName}",
                            StanowiskoId = stanowiskoId
                        };
                        _context.Zdjecia.Add(zdjecie);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing image {file.FileName}: {ex.Message}");
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Stanowisko>> GetById(int id)
        {
            var stanowisko = await _context.Stanowiska
                .Include(s => s.Sala)
                .Include(s => s.Zdjecia)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (stanowisko == null) return NotFound();
            return stanowisko;
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStanowisko(int id, [FromForm] CreateStanowiskoDto dto, 
            [FromForm] List<IFormFile>? zdjecia, [FromForm] List<int>? zdjeciaDoUsuniecia)
        {
            var stanowisko = await _context.Stanowiska.FindAsync(id);
            if (stanowisko == null) return NotFound();

            stanowisko.SalaId = dto.SalaId;
            stanowisko.Nazwa = dto.Nazwa;
            stanowisko.Typ = dto.Typ;
            stanowisko.Opis = dto.Opis;
            stanowisko.CzyAktywny = dto.CzyAktywny;

            await _context.SaveChangesAsync();

            // Obsługa selektywnego usuwania zdjęć
            if (zdjeciaDoUsuniecia != null && zdjeciaDoUsuniecia.Count > 0)
            {
                var zdjeciaDoUsunieciaFromDb = await _context.Zdjecia
                    .Where(z => z.StanowiskoId == id && zdjeciaDoUsuniecia.Contains(z.Id))
                    .ToListAsync();

                foreach (var zdjecie in zdjeciaDoUsunieciaFromDb)
                {
                    // Usuń plik z dysku
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", zdjecie.Url.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        try
                        {
                            System.IO.File.Delete(filePath);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error deleting file {filePath}: {ex.Message}");
                        }
                    }
                }

                // Usuń rekordy z bazy
                _context.Zdjecia.RemoveRange(zdjeciaDoUsunieciaFromDb);
                await _context.SaveChangesAsync();
            }

            // Obsługa dodawania nowych zdjęć
            if (zdjecia != null && zdjecia.Count > 0)
            {
                await SaveZdjeciaForStanowisko(id, zdjecia);
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStanowisko(int id)
        {
            var stanowisko = await _context.Stanowiska.FindAsync(id);
            if (stanowisko == null) return NotFound();
            _context.Stanowiska.Remove(stanowisko);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Endpointy dla opiekuna
        [HttpGet("opiekun/me")]
        [Authorize(Roles = "Opiekun,Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetMojeStanowiska()
        {
            var userId = User.Identity.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userId);
            
            if (user == null) return NotFound("Użytkownik nie istnieje");

            // Pobierz stanowiska z sal, dla których user jest opiekunem
            var mojeStanowiska = await _context.Stanowiska
                .Include(s => s.Sala)
                .Where(s => s.Sala.IdOpiekuna == user.Id)
                .Select(s => new
                {
                    Id = s.Id,
                    Nazwa = s.Nazwa,
                    Typ = s.Typ,
                    Opis = s.Opis,
                    SalaId = s.SalaId,
                    SalaNumer = s.Sala.Numer,
                    SalaBudynek = s.Sala.Budynek
                })
                .ToListAsync();

            return Ok(mojeStanowiska);
        }

        [HttpPut("opiekun/{id}")]
        [Authorize(Roles = "Opiekun,Admin")]
        public async Task<IActionResult> UpdateMojeStanowisko(int id, [FromBody] UpdateMojeStanowiskoDto dto)
        {
            var userId = User.Identity.Name;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userId);
            
            if (user == null) return NotFound("Użytkownik nie istnieje");

            var stanowisko = await _context.Stanowiska
                .Include(s => s.Sala)
                .FirstOrDefaultAsync(s => s.Id == id && s.Sala.IdOpiekuna == user.Id);

            if (stanowisko == null) return NotFound("Stanowisko nie istnieje lub nie jesteś opiekunem tej sali");

            // Opiekun może edytować tylko opis stanowiska
            if (!string.IsNullOrEmpty(dto.Opis))
            {
                stanowisko.Opis = dto.Opis;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}
