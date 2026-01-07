using Backend.Dto;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
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
        private readonly IAuditService _auditService;
        private readonly ITokenHashingService _tokenHashingService;
        private readonly ILoginAttemptService _loginAttemptService;
        private static readonly SemaphoreSlim _refreshSemaphore = new(1, 1); // Mutex dla refresh

        public AccountController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration config, IAuditService auditService, ITokenHashingService tokenHashingService, ILoginAttemptService loginAttemptService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
            _auditService = auditService;
            _tokenHashingService = tokenHashingService;
            _loginAttemptService = loginAttemptService;
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Każdy użytkownik powinien mieć przynajmniej rolę "Uzytkownik"
            // Jeśli nie ma ról, oznacza to błąd systemu
            if (!roles.Any())
            {
                throw new InvalidOperationException("Użytkownik nie ma przypisanych ról");
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                expires: DateTime.UtcNow.AddMinutes(15), // Krótszy czas życia access token
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
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
                await _userManager.AddToRoleAsync(user, "Uzytkownik");
                
                // Log rejestracji nowego użytkownika
                await _auditService.LogAsync("REJESTRACJA_UZYTKOWNIKA", "User", null, 
                    $"Email: {dto.Email}, Imie: {dto.Imie}, Nazwisko: {dto.Nazwisko}, Rola: Uzytkownik");
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
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Timing attack protection - always wait ~200ms
            var delay = Task.Delay(Random.Shared.Next(150, 250));

            // Get IP address from request
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() 
                ?? HttpContext.Request.Headers["X-Real-IP"].FirstOrDefault() 
                ?? HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault() 
                ?? "unknown";

            // Check if IP is blocked
            if (await _loginAttemptService.IsIpBlockedAsync(ipAddress))
            {
                var blockTimeRemaining = await _loginAttemptService.GetBlockTimeRemainingAsync(ipAddress);
                var remainingMinutes = Math.Ceiling(blockTimeRemaining?.TotalMinutes ?? 0);
                
                // Log blocked IP attempt
                await _auditService.LogAsync("LOGOWANIE_IP_ZABLOKOWANE", "User", null, 
                    $"IP: {ipAddress}, Email: {dto.Email}, Pozostaly czas blokady: {remainingMinutes} minut");

                await delay;
                return BadRequest(new { 
                    message = $"Zbyt wiele nieudanych prób logowania z tego adresu IP. Spróbuj ponownie za {remainingMinutes} minut.",
                    type = "ip_blocked",
                    remainingMinutes = remainingMinutes
                });
            }

            var user = await _userManager.FindByEmailAsync(dto.Email);
            
            if (user == null)
            {
                // Record failed attempt for IP (even for non-existent email)
                await _loginAttemptService.RecordFailedAttemptAsync(ipAddress);
                
                // Log nieudanego logowania - nieistniejący email
                await _auditService.LogAsync("LOGOWANIE_NIEUDANE", "User", null, 
                    $"IP: {ipAddress}, Email: {dto.Email}, Powod: Nieistniejacy email");

                await delay;
                return BadRequest(new { 
                    message = "Nieprawidłowy email lub hasło",
                    type = "invalid_credentials"
                });
            }

            // Check password (no account lockout, only IP-based blocking)
            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: false);
            
            if (result.Succeeded)
            {
                // Reset IP-based failed attempts on successful login
                await _loginAttemptService.ResetAttemptsAsync(ipAddress);
                
                var accessToken = await GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();
                var refreshTokenHash = _tokenHashingService.HashToken(refreshToken);

                user.RefreshTokenHash = refreshTokenHash;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userManager.UpdateAsync(user);

                // Set refresh token in httpOnly cookie
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, // false dla HTTP w developmencie
                    SameSite = SameSiteMode.Lax, // Lax działa dla localhost cross-origin
                    Path = "/",
                    Domain = null,
                    Expires = DateTime.UtcNow.AddDays(7)
                };
                Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

                // Log udanego logowania
                await _auditService.LogAsync("LOGOWANIE_UDANE", "User", null, $"IP: {ipAddress}, Email: {dto.Email}");

                await delay;
                return Ok(new
                {
                    AccessToken = accessToken,
                    Expiration = DateTime.UtcNow.AddMinutes(15)
                });
            }
            
            // Password incorrect - record failed attempt for IP
            await _loginAttemptService.RecordFailedAttemptAsync(ipAddress);

            // Get remaining attempts for this IP
            var remainingAttempts = await _loginAttemptService.GetRemainingAttemptsAsync(ipAddress);

            // Log nieudanego logowania - błędne hasło
            await _auditService.LogAsync("LOGOWANIE_NIEUDANE", "User", null, 
                $"IP: {ipAddress}, Email: {dto.Email}, Powod: Bledne haslo, Pozostalo prob: {remainingAttempts}");

            await delay;

            // Different messages based on remaining attempts
            if (remainingAttempts == 0)
            {
                return BadRequest(new { 
                    message = "Zbyt wiele nieudanych prób logowania. Twój adres IP został zablokowany na 15 minut.",
                    type = "ip_blocked_now",
                    remainingMinutes = 15
                });
            }
            else if (remainingAttempts == 1)
            {
                return BadRequest(new { 
                    message = "Nieprawidłowy email lub hasło. UWAGA: Kolejna nieudana próba spowoduje zablokowanie adresu IP na 15 minut!",
                    type = "last_attempt_warning",
                    remainingAttempts = remainingAttempts
                });
            }
            else if (remainingAttempts <= 2)
            {
                return BadRequest(new { 
                    message = $"Nieprawidłowy email lub hasło. Pozostało {remainingAttempts} prób przed zablokowaniem adresu IP.",
                    type = "few_attempts_left",
                    remainingAttempts = remainingAttempts
                });
            }
            else
            {
                return BadRequest(new { 
                    message = "Nieprawidłowy email lub hasło. Sprawdź wprowadzone dane.",
                    type = "invalid_credentials",
                    remainingAttempts = remainingAttempts
                });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            Console.WriteLine("=== REFRESH TOKEN ENDPOINT CALLED ===");
            
            // Czekaj na dostęp do sekcji krytycznej (max 10 sekund)
            if (!await _refreshSemaphore.WaitAsync(TimeSpan.FromSeconds(10)))
            {
                Console.WriteLine("ERROR: Timeout waiting for refresh semaphore");
                return StatusCode(503, "Server busy, try again later");
            }

            try
            {
                var refreshTokenFromCookie = Request.Cookies["refreshToken"];
                Console.WriteLine($"Refresh token from cookie (raw): {refreshTokenFromCookie}");
                
                if (string.IsNullOrEmpty(refreshTokenFromCookie))
                {
                    Console.WriteLine("ERROR: Refresh token not found in cookies");
                    Console.WriteLine("Available cookies:");
                    foreach (var cookie in Request.Cookies)
                    {
                        Console.WriteLine($"  {cookie.Key}: {cookie.Value}");
                    }
                    return BadRequest("Refresh token not found");
                }
                
                // Hashuj token z cookie
                var refreshTokenHash = _tokenHashingService.HashToken(refreshTokenFromCookie);
                Console.WriteLine($"Refresh token hash: {refreshTokenHash}");

                // Znajdź użytkownika po refresh token hash
                var user = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.RefreshTokenHash == refreshTokenHash && u.RefreshTokenExpiryTime > DateTime.UtcNow);

                if (user == null)
                {
                    Console.WriteLine("ERROR: User not found or refresh token expired");
                    Console.WriteLine($"Searched for token hash: {refreshTokenHash}");
                    Console.WriteLine($"Current UTC time: {DateTime.UtcNow}");
                    
                    // Sprawdź czy użytkownik w ogóle istnieje
                    var allUsers = await _userManager.Users.CountAsync();
                    Console.WriteLine($"Total users in database: {allUsers}");
                    
                    // Sprawdź czy istnieje użytkownik z tym tokenem (bez sprawdzania daty)
                    var userWithToken = await _userManager.Users
                        .FirstOrDefaultAsync(u => u.RefreshTokenHash == refreshTokenHash);
                    if (userWithToken != null)
                    {
                        Console.WriteLine($"Found user with token but expired. Expiry: {userWithToken.RefreshTokenExpiryTime}");
                    }
                    
                    return BadRequest("Invalid refresh token");
                }

                var newAccessToken = await GenerateJwtToken(user);
                var newRefreshToken = GenerateRefreshToken();
                var newRefreshTokenHash = _tokenHashingService.HashToken(newRefreshToken);

                user.RefreshTokenHash = newRefreshTokenHash;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

                await _userManager.UpdateAsync(user);

                // Ustaw nowy refresh token w cookie
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, // false dla HTTP w developmencie
                    SameSite = SameSiteMode.Lax, // Lax działa dla localhost cross-origin
                    Path = "/",
                    Domain = null,
                    Expires = DateTime.UtcNow.AddDays(7)
                };
                Response.Cookies.Append("refreshToken", newRefreshToken, cookieOptions);

                Console.WriteLine("✅ Token refreshed successfully");
                return Ok(new
                {
                    AccessToken = newAccessToken,
                    Expiration = DateTime.UtcNow.AddMinutes(15)
                });
            }
            finally
            {
                _refreshSemaphore.Release();
            }
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"])),
                ValidateLifetime = false // Nie sprawdzamy czy token wygasł
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken || 
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal;
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var username = User.Identity?.Name;
            if (!string.IsNullOrEmpty(username))
            {
                var user = await _userManager.FindByNameAsync(username);
                if (user != null)
                {
                    user.RefreshTokenHash = null;
                    user.RefreshTokenExpiryTime = DateTime.UtcNow;
                    await _userManager.UpdateAsync(user);
                }
            }

            // Usuń refresh token cookie
            Response.Cookies.Delete("refreshToken");

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
        roles = roles,
        numerTelefonu = user.PhoneNumber
    });
}

        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetUserStats()
        {
            var users = await _userManager.Users.ToListAsync();
            
            // Policz użytkowników według ról
            var adminCount = 0;
            var opiekunCount = 0;
            var nauczycielCount = 0;
            var studentCount = 0;
            var unconfirmedCount = 0; // Tylko rola "Uzytkownik" bez ról biznesowych

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                
                // Priorytet: Admin > Opiekun > Nauczyciel > Student > Niezatwierdzony
                if (roles.Contains("Admin"))
                    adminCount++;
                else if (roles.Contains("Opiekun"))
                    opiekunCount++;
                else if (roles.Contains("Nauczyciel"))
                    nauczycielCount++;
                else if (roles.Contains("Student"))
                    studentCount++;
                else if (roles.Contains("Uzytkownik") && roles.Count == 1)
                    unconfirmedCount++; // Tylko podstawowa rola = niezatwierdzony
            }

            return Ok(new
            {
                TotalUsers = users.Count,
                AdminUsers = adminCount,
                OpiekunUsers = opiekunCount,
                NauczycielUsers = nauczycielCount,
                StudentUsers = studentCount,
                UnconfirmedUsers = unconfirmedCount
            });
        }

        // Publiczny endpoint dla strony głównej - tylko liczba użytkowników (bez wrażliwych danych)
        [HttpGet("public-count")]
        public async Task<ActionResult<object>> GetPublicUserCount()
        {
            try
            {
                // Policz tylko zatwierdzone konta (bez roli "Niezatwierdzony")
                var users = await _userManager.Users.ToListAsync();
                var confirmedUsers = 0;

                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    // Policz tylko użytkowników z rolami biznesowymi (nie tylko "Uzytkownik")
                    if (roles.Any(r => r != "Uzytkownik"))
                    {
                        confirmedUsers++;
                    }
                }

                return Ok(new { TotalUsers = confirmedUsers });
            }
            catch (Exception ex)
            {
                // W przypadku błędu zwróć szacowaną liczbę
                return Ok(new { TotalUsers = 0 });
            }
        }

    }

}
