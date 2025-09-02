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
        public async Task<ActionResult<IEnumerable<Stanowisko>>> GetAll()
        {
            return await _context.Stanowiska.Include(s => s.Sala).ToListAsync();
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
                Opis = dto.Opis
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
        public async Task<IActionResult> UpdateStanowisko(int id, [FromForm] CreateStanowiskoDto dto, [FromForm] List<IFormFile>? zdjecia)
        {
            var stanowisko = await _context.Stanowiska.FindAsync(id);
            if (stanowisko == null) return NotFound();

            stanowisko.SalaId = dto.SalaId;
            stanowisko.Nazwa = dto.Nazwa;
            stanowisko.Typ = dto.Typ;
            stanowisko.Opis = dto.Opis;

            await _context.SaveChangesAsync();

            // Obsługa nowych zdjęć - zastąp stare zdjęcia nowymi
            if (zdjecia != null && zdjecia.Count > 0)
            {
                // Usuń stare zdjęcia z bazy danych
                var stareZdjecia = await _context.Zdjecia.Where(z => z.StanowiskoId == id).ToListAsync();
                _context.Zdjecia.RemoveRange(stareZdjecia);
                await _context.SaveChangesAsync();

                // Usuń stare pliki z dysku
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "stanowiska", $"stanowisko-{id}");
                if (Directory.Exists(uploadsPath))
                {
                    Directory.Delete(uploadsPath, true);
                }

                // Dodaj nowe zdjęcia
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

    }
}
