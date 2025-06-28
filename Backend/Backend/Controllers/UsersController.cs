using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : Controller
    {

        private readonly UserManager<ApplicationUser> _userManager;

        public UsersController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("teachers")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetTeachers()
        {
            var nauczyciele = await _userManager.GetUsersInRoleAsync("Nauczyciel");

            var result = nauczyciele.Select(u => new UserDto
            {
                Id = u.Id,
                Imie = u.Imie,
                Nazwisko = u.Nazwisko,
                Email = u.Email
            });

            return Ok(result);
        }


    }
}
