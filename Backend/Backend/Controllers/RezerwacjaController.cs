using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    }
}
