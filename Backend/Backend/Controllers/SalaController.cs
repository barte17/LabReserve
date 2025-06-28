using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalaController : Controller
    {
        private readonly AppDbContext _context;

        public SalaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sala>>> GetAll()
        {
            return await _context.Sale.ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> CreateSala(CreateSalaDto dto)
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
            return CreatedAtAction(nameof(GetById), new { id = sala.Id }, sala);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sala>> GetById(int id)
        {
            var sala = await _context.Sale.FindAsync(id);
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
    }
}
