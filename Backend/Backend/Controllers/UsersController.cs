using Backend.Dto;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Services;

namespace Backend.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : Controller
    {

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;
        private readonly IPowiadomieniaService _powiadomieniaService;
        private readonly IAuditService _auditService;

        public UsersController(UserManager<ApplicationUser> userManager, AppDbContext context, 
            IPowiadomieniaService powiadomieniaService, IAuditService auditService)
        {
            _userManager = userManager;
            _context = context;
            _powiadomieniaService = powiadomieniaService;
            _auditService = auditService;
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
            
            // Sprawdź czy faktycznie coś się zmieniło
            var oldRolesSet = currentRoles.OrderBy(r => r).ToList();
            var newRolesSet = dto.Roles.OrderBy(r => r).ToList();
            var rolesChanged = !oldRolesSet.SequenceEqual(newRolesSet);
            
            if (!rolesChanged)
            {
                return Ok(new { message = "Role są już aktualne." });
            }

            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded) return BadRequest("Nie udało się usunąć starych ról");

            var addResult = await _userManager.AddToRolesAsync(user, dto.Roles);
            if (!addResult.Succeeded) return BadRequest("Nie udało się dodać nowych ról");

            // Przygotuj dane dla powiadomienia i audytu
            var adminUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var adminUser = await _userManager.FindByIdAsync(adminUserId);
            var adminName = adminUser != null ? $"{adminUser.Imie} {adminUser.Nazwisko}" : "Administrator";
            
            var oldRolesText = oldRolesSet.Count > 0 ? string.Join(", ", oldRolesSet) : "brak ról";
            var newRolesText = newRolesSet.Count > 0 ? string.Join(", ", newRolesSet) : "brak ról";

            try
            {
                // Wyślij powiadomienie użytkownikowi o zmianie ról
                var tytul = "Zmiana uprawnien w systemie";
                var tresc = GenerateRoleChangeMessage(oldRolesSet, newRolesSet, adminName);
                
                await _powiadomieniaService.WyslijPowiadomienieAsync(
                    uzytkownikId: id,
                    tytul: tytul,
                    tresc: tresc,
                    typ: "system",
                    priorytet: "high"
                );

                // Log audit
                await _auditService.LogAsync(
                    "ZMIANA_ROL_UZYTKOWNIKA", 
                    "User", 
                    null, 
                    $"Użytkownik: {user.Email} ({user.Imie} {user.Nazwisko}), " +
                    $"Stare role: [{oldRolesText}], " +
                    $"Nowe role: [{newRolesText}], " +
                    $"Admin: {adminName}"
                );
            }
            catch (Exception ex)
            {
                // Nie przerywaj procesu zmiany ról jeśli powiadomienie się nie udało
                System.Console.WriteLine($"Błąd podczas wysyłania powiadomienia o zmianie ról: {ex.Message}");
            }

            return Ok(new { message = "Role zostały pomyślnie zaktualizowane." });
        }

        private string GenerateRoleChangeMessage(List<string> oldRoles, List<string> newRoles, string adminName)
        {
            var addedRoles = newRoles.Except(oldRoles).ToList();
            var removedRoles = oldRoles.Except(newRoles).ToList();
            
            var message = $"Administrator {adminName} zmienił Twoje uprawnienia w systemie.{Environment.NewLine}{Environment.NewLine}";
            
            if (addedRoles.Any())
            {
                message += $"Dodane role: {string.Join(", ", addedRoles)}{Environment.NewLine}";
            }
            
            if (removedRoles.Any())
            {
                message += $"Usunięte role: {string.Join(", ", removedRoles)}{Environment.NewLine}";
            }
            
            message += $"{Environment.NewLine}Twoje aktualne role: {string.Join(", ", newRoles)}{Environment.NewLine}{Environment.NewLine}";
            
            if (addedRoles.Contains("Student"))
            {
                message += $"• Możesz teraz rezerwować stanowiska laboratoryjne{Environment.NewLine}";
            }
            if (addedRoles.Contains("Nauczyciel"))
            {
                message += $"• Możesz teraz rezerwować sale i stanowiska laboratoryjne{Environment.NewLine}";
            }
            if (addedRoles.Contains("Opiekun"))
            {
                message += $"• Możesz teraz zarządzać przypisanymi salami laboratoryjnymi{Environment.NewLine}";
            }
            if (addedRoles.Contains("Admin"))
            {
                message += $"• Masz teraz pełne uprawnienia administratora systemu{Environment.NewLine}";
            }
            
            if (removedRoles.Any() && !newRoles.Any(r => r != "Uzytkownik"))
            {
                message += $"{Environment.NewLine}⚠️ Twoje konto wymaga ponownej aktywacji do korzystania z funkcji rezerwacji{Environment.NewLine}";
            }
            
            message += $"{Environment.NewLine}Jeśli dalej masz problemy z uprawnieniami, odśwież stronę. W razie dalszych problemów skontaktuj się ze wsparciem.";
            
            return message;
        }


    }
}
