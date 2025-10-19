using Backend.Dto;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserPreferencesController : ControllerBase
    {
        private readonly IUserPreferencesService _preferencesService;
        private readonly ILogger<UserPreferencesController> _logger;

        public UserPreferencesController(
            IUserPreferencesService preferencesService,
            ILogger<UserPreferencesController> logger)
        {
            _preferencesService = preferencesService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<UserPreferencesDto>> GetPreferences()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                var preferences = await _preferencesService.GetUserPreferencesAsync(userId);
                
                var dto = new UserPreferencesDto
                {
                    EmailNotifications = new EmailNotificationSettingsDto
                    {
                        StatusChange = preferences.EmailNotifications.StatusChange,
                        NewReservations = preferences.EmailNotifications.NewReservations
                    },
                    Theme = preferences.Theme
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas pobierania preferencji");
                return StatusCode(500, "Wystąpił błąd podczas pobierania preferencji");
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePreferences([FromBody] UpdatePreferencesDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                // Pobierz aktualne preferencje
                var currentPreferences = await _preferencesService.GetUserPreferencesAsync(userId);

                // Aktualizuj tylko podane pola
                if (dto.EmailNotifications != null)
                {
                    currentPreferences.EmailNotifications.StatusChange = dto.EmailNotifications.StatusChange;
                    currentPreferences.EmailNotifications.NewReservations = dto.EmailNotifications.NewReservations;
                }

                if (!string.IsNullOrEmpty(dto.Theme))
                {
                    if (dto.Theme != "normal" && dto.Theme != "dark")
                    {
                        return BadRequest("Theme musi być 'normal' lub 'dark'");
                    }
                    currentPreferences.Theme = dto.Theme;
                }

                var success = await _preferencesService.UpdateUserPreferencesAsync(userId, currentPreferences);
                if (!success)
                {
                    return StatusCode(500, "Nie udało się zaktualizować preferencji");
                }

                return Ok(new { message = "Preferencje zostały zaktualizowane" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas aktualizacji preferencji");
                return StatusCode(500, "Wystąpił błąd podczas aktualizacji preferencji");
            }
        }

        [HttpGet("theme")]
        public async Task<ActionResult<string>> GetTheme()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("Nie można zidentyfikować użytkownika");
                }

                var theme = await _preferencesService.GetUserThemeAsync(userId);
                return Ok(new { theme });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Błąd podczas pobierania theme");
                return StatusCode(500, "Wystąpił błąd podczas pobierania theme");
            }
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}