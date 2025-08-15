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

        public SalaController(AppDbContext context)
        {
            _context = context;
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
