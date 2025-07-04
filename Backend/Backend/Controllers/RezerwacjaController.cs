using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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
        public async Task<ActionResult<IEnumerable<RezerwacjaDto>>> GetAll()
        {
            var rezerwacje = await _context.Rezerwacje
                .Select(r => new RezerwacjaDto
                {
                    Id = r.Id,
                    SalaId = r.SalaId,
                    StanowiskoId = r.StanowiskoId,
                    UzytkownikId = r.UzytkownikId,
                    DataUtworzenia = r.DataUtworzenia,
                    DataStart = r.DataStart,
                    DataKoniec = r.DataKoniec,
                    Status = r.Status,
                    Opis = r.Opis
                })
                .ToListAsync();

            return Ok(rezerwacje);
        }

        [HttpPatch("{id}/status")]
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
        public async Task<IActionResult> Delete(int id)
        {
            var rezerwacja = await _context.Rezerwacje.FindAsync(id);
            if (rezerwacja == null)
                return NotFound();

            _context.Rezerwacje.Remove(rezerwacja);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
