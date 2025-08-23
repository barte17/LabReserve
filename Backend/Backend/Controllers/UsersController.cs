using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : Controller
    {

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;

        public UsersController(UserManager<ApplicationUser> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("opiekunowie")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetOpiekunowie()
        {
            // Użyj UserManager - jest bezpieczny i zoptymalizowany przez Microsoft
            var opiekunowie = await _userManager.GetUsersInRoleAsync("Opiekun");

            var result = opiekunowie.Select(u => new UserDto
            {
                Id = u.Id,
                Imie = u.Imie,
                Nazwisko = u.Nazwisko,
                Email = u.Email
            });

            return Ok(result);
        }



        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            // Pobierz użytkowników
            var users = await _context.Users.ToListAsync();
            
            // Pobierz wszystkie role użytkowników w jednym zapytaniu
            var userRolesData = await _context.UserRoles
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, r.Name })
                .ToListAsync();

            // Grupuj role po UserId w pamięci (ToLookup działa tylko na IEnumerable, nie IQueryable)
            var userRolesLookup = userRolesData.ToLookup(x => x.UserId, x => x.Name);

            var result = users.Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                Imie = u.Imie,
                Nazwisko = u.Nazwisko,
                Roles = userRolesLookup[u.Id].ToList()
            });

            return Ok(result);
        }


        [HttpPut("{id}/roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeUserRoles(string id, [FromBody] ChangeRolesDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded) return BadRequest("Nie udało się usunąć starych ról");

            var addResult = await _userManager.AddToRolesAsync(user, dto.Roles);
            if (!addResult.Succeeded) return BadRequest("Nie udało się dodać nowych ról");

            return Ok(new { message = "Role zostały pomyślnie zaktualizowane." });

        }


    }
}
