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
    public class SalaController : Controller
    {
        private readonly AppDbContext _context;
        private readonly Backend.Services.IImageProcessingService _imageProcessingService;

        public SalaController(AppDbContext context, Backend.Services.IImageProcessingService imageProcessingService)
        {
            _context = context;
            _imageProcessingService = imageProcessingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalaDto>>> GetAll()
        {
            var sale = await _context.Sale
                .Include(s => s.Opiekun)
                .Select(s => new SalaDto
                {
                    Id = s.Id,
                    Numer = s.Numer,
                    Budynek = s.Budynek,
                    MaxOsob = s.MaxOsob,
                    MaStanowiska = s.MaStanowiska,
                    CzynnaOd = s.CzynnaOd,
                    CzynnaDo = s.CzynnaDo,
                    Opis = s.Opis,
                    IdOpiekuna = s.IdOpiekuna,
                    ImieOpiekuna = s.Opiekun != null ? s.Opiekun.Imie : null,
                    NazwiskoOpiekuna = s.Opiekun != null ? s.Opiekun.Nazwisko : null
                })
                .ToListAsync();

            return Ok(sale);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSala([FromForm] CreateSalaDto dto, [FromForm] List<IFormFile>? zdjecia)
        {
            var sala = new Sala
            {
                Numer = dto.Numer,
                Budynek = dto.Budynek,
                MaxOsob = dto.MaxOsob,
                MaStanowiska = dto.MaStanowiska,
                CzynnaOd = dto.CzynnaOd,
                CzynnaDo = dto.CzynnaDo,
                Opis = dto.Opis,
                IdOpiekuna = dto.IdOpiekuna
            };

            _context.Sale.Add(sala);
            await _context.SaveChangesAsync();

            // Obsługa zdjęć
            if (zdjecia != null && zdjecia.Count > 0)
            {
                await SaveZdjeciaForSala(sala.Id, zdjecia);
            }

            return CreatedAtAction(nameof(GetById), new { id = sala.Id }, sala);
        }

        private async Task SaveZdjeciaForSala(int salaId, List<IFormFile> zdjecia)
        {
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "sale", $"sala-{salaId}");

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
                            Url = $"/uploads/sale/sala-{salaId}/{processedFileName}",
                            SalaId = salaId
                        };
                        _context.Zdjecia.Add(zdjecie);
                    }
                    catch (Exception ex)
                    {
                        // Log error but continue with other images
                        Console.WriteLine($"Error processing image {file.FileName}: {ex.Message}");
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sala>> GetById(int id)
        {
            var sala = await _context.Sale
                .Include(s => s.Opiekun)
                .Include(s => s.Zdjecia)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (sala == null) return NotFound();
            return sala;
        }

        [HttpGet("stanowiska-dozwolone")]
        public async Task<ActionResult<IEnumerable<SalaDto>>> GetSaleZStanowiskami()
        {
            var sale = await _context.Sale
                .Where(s => s.MaStanowiska == true)
                .Select(s => new SalaDto
                {
                    Id = s.Id,
                    Numer = s.Numer,
                    Budynek = s.Budynek
                })
                .ToListAsync();

            return Ok(sale);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSala(int id, CreateSalaDto dto)
        {
            var sala = await _context.Sale.FindAsync(id);
            if (sala == null) return NotFound();

            sala.Numer = dto.Numer;
            sala.Budynek = dto.Budynek;
            sala.MaxOsob = dto.MaxOsob;
            sala.MaStanowiska = dto.MaStanowiska;
            sala.CzynnaOd = dto.CzynnaOd;
            sala.CzynnaDo = dto.CzynnaDo;
            sala.Opis = dto.Opis;
            sala.IdOpiekuna = dto.IdOpiekuna;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSala(int id)
        {
            var sala = await _context.Sale.FindAsync(id);
            if (sala == null) return NotFound();
            _context.Sale.Remove(sala);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
