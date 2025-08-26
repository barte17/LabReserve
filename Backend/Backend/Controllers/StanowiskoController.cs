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

        public StanowiskoController(AppDbContext context)
        {
            _context = context;
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
            Directory.CreateDirectory(uploadsPath);

            foreach (var (file, index) in zdjecia.Select((f, i) => (f, i)))
            {
                if (file.Length > 0)
                {
                    // Walidacja typu pliku
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    
                    if (!allowedExtensions.Contains(extension))
                        continue;

                    // Generowanie unikalnej nazwy
                    var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                    var fileName = $"{timestamp}_img-{index + 1}{extension}";
                    var filePath = Path.Combine(uploadsPath, fileName);

                    // Zapisanie pliku
                    using var stream = new FileStream(filePath, FileMode.Create);
                    await file.CopyToAsync(stream);

                    // Dodanie rekordu do bazy
                    var zdjecie = new Zdjecie
                    {
                        Url = $"/uploads/stanowiska/stanowisko-{stanowiskoId}/{fileName}",
                        StanowiskoId = stanowiskoId
                    };
                    _context.Zdjecia.Add(zdjecie);
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
        public async Task<IActionResult> UpdateStanowisko(int id, CreateStanowiskoDto dto)
        {
            var stanowisko = await _context.Stanowiska.FindAsync(id);
            if (stanowisko == null) return NotFound();

            stanowisko.SalaId = dto.SalaId;
            stanowisko.Nazwa = dto.Nazwa;
            stanowisko.Typ = dto.Typ;
            stanowisko.Opis = dto.Opis;

            await _context.SaveChangesAsync();
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
