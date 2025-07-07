using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _config;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AccountController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                Imie = dto.Imie,
                Nazwisko = dto.Nazwisko,
                EmailConfirmed = true
            };

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);

                return BadRequest(string.Join(" | ", errors));
            }

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "Niezatwierdzony");
            }

            if (!result.Succeeded)
            {
                var errorMessages = result.Errors.Select(e => e.Description);
                return BadRequest(string.Join(" | ", errorMessages));
            }

            return Ok(new { message = "Zarejestrowano pomyślnie" });

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized("Nieprawidłowe dane logowania");

            var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                expires: DateTime.Now.AddHours(2),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);
            return Ok();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userName = User.Identity.Name;
            var user = await _userManager.FindByNameAsync(userName);

            if (user == null)
                return NotFound("Użytkownik nie istnieje");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                imie = user.Imie,
                nazwisko = user.Nazwisko,
                rola = roles.FirstOrDefault() ?? "Brak",
                numerTelefonu = user.PhoneNumber
            });
        }

    }

}
