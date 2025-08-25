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
        public async Task<IActionResult> CreateStanowisko(CreateStanowiskoDto dto)
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
            return CreatedAtAction(nameof(GetById), new { id = stanowisko.Id }, stanowisko);
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
