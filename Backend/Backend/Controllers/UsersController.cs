using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : Controller
    {

        private readonly UserManager<ApplicationUser> _userManager;

        public UsersController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("opiekunowie")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetOpiekunowie()
        {
            var nauczyciele = await _userManager.GetUsersInRoleAsync("Opiekun");

            var result = nauczyciele.Select(u => new UserDto
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
            var users = await _userManager.Users.ToListAsync();
            var result = new List<UserDto>();

            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                result.Add(new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Imie = u.Imie,
                    Nazwisko = u.Nazwisko,
                    Roles = roles.ToList()
                });
            }

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
