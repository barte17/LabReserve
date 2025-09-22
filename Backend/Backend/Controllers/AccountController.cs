using Backend.Dto;
using Backend.Models;
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
        private static readonly SemaphoreSlim _refreshSemaphore = new(1, 1); // Mutex dla refresh

        public AccountController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
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

            if (!roles.Any())
            {
                authClaims.Add(new Claim(ClaimTypes.Role, "Niezatwierdzony"));
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
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Timing attack protection - always wait ~200ms
            var delay = Task.Delay(Random.Shared.Next(150, 250));

            var user = await _userManager.FindByEmailAsync(dto.Email);
            
            if (user == null)
            {
                await delay;
                return BadRequest(new { 
                    message = "Nieprawidłowy email lub hasło",
                    type = "invalid_credentials"
                });
            }

            // Check if account is locked out
            if (await _userManager.IsLockedOutAsync(user))
            {
                var lockoutEnd = await _userManager.GetLockoutEndDateAsync(user);
                var remainingTime = lockoutEnd?.Subtract(DateTimeOffset.UtcNow);
                var remainingMinutes = Math.Ceiling(remainingTime?.TotalMinutes ?? 0);
                
                await delay;
                return BadRequest(new { 
                    message = $"Konto zostało zablokowane z powodu zbyt wielu nieudanych prób logowania. Spróbuj ponownie za {remainingMinutes} minut.",
                    type = "account_locked",
                    remainingMinutes = remainingMinutes,
                    lockoutEnd = lockoutEnd?.ToString("yyyy-MM-dd HH:mm:ss")
                });
            }

            // Get current failed attempts before checking password
            var currentFailedAttempts = await _userManager.GetAccessFailedCountAsync(user);

            // Check password with lockout on failure enabled
            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);
            
            if (result.Succeeded)
            {
                // Reset failed access attempts on successful login
                await _userManager.ResetAccessFailedCountAsync(user);
                
                var accessToken = await GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userManager.UpdateAsync(user);

                // Set refresh token in httpOnly cookie
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Strict,
                    Path = "/",
                    Domain = null,
                    Expires = DateTime.UtcNow.AddDays(7)
                };
                Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

                await delay;
                return Ok(new
                {
                    AccessToken = accessToken,
                    Expiration = DateTime.UtcNow.AddMinutes(15)
                });
            }
            
            if (result.IsLockedOut)
            {
                await delay;
                return BadRequest(new { 
                    message = "Konto zostało zablokowane na 15 minut z powodu zbyt wielu nieudanych prób logowania.",
                    type = "account_locked_now",
                    remainingMinutes = 15
                });
            }

            // Get updated failed attempts count
            var newFailedAttempts = await _userManager.GetAccessFailedCountAsync(user);
            var maxAttempts = 5; // From Identity configuration
            var remainingAttempts = maxAttempts - newFailedAttempts;

            await delay;

            // Different messages based on remaining attempts
            if (remainingAttempts <= 1)
            {
                return BadRequest(new { 
                    message = "Nieprawidłowy email lub hasło. UWAGA: Kolejna nieudana próba spowoduje zablokowanie konta na 15 minut!",
                    type = "last_attempt_warning",
                    remainingAttempts = remainingAttempts,
                    failedAttempts = newFailedAttempts
                });
            }
            else if (remainingAttempts <= 2)
            {
                return BadRequest(new { 
                    message = $"Nieprawidłowy email lub hasło. Pozostało {remainingAttempts} prób przed zablokowaniem konta.",
                    type = "few_attempts_left",
                    remainingAttempts = remainingAttempts,
                    failedAttempts = newFailedAttempts
                });
            }
            else
            {
                return BadRequest(new { 
                    message = "Nieprawidłowy email lub hasło. Sprawdź wprowadzone dane.",
                    type = "invalid_credentials",
                    remainingAttempts = remainingAttempts,
                    failedAttempts = newFailedAttempts
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
                
                // Użyj tokenu bezpośrednio - nie dekoduj URL
                var refreshTokenToUse = refreshTokenFromCookie;
                Console.WriteLine($"Refresh token to use: {refreshTokenToUse}");

                // Znajdź użytkownika po refresh token zamiast access token
                var user = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.RefreshToken == refreshTokenToUse && u.RefreshTokenExpiryTime > DateTime.UtcNow);

                if (user == null)
                {
                    Console.WriteLine("ERROR: User not found or refresh token expired");
                    Console.WriteLine($"Searched for token: {refreshTokenToUse}");
                    Console.WriteLine($"Current UTC time: {DateTime.UtcNow}");
                    
                    // Sprawdź czy użytkownik w ogóle istnieje
                    var allUsers = await _userManager.Users.CountAsync();
                    Console.WriteLine($"Total users in database: {allUsers}");
                    
                    // Sprawdź czy istnieje użytkownik z tym tokenem (bez sprawdzania daty)
                    var userWithToken = await _userManager.Users
                        .FirstOrDefaultAsync(u => u.RefreshToken == refreshTokenToUse);
                    if (userWithToken != null)
                    {
                        Console.WriteLine($"Found user with token but expired. Expiry: {userWithToken.RefreshTokenExpiryTime}");
                    }
                    
                    return BadRequest("Invalid refresh token");
                }

                var newAccessToken = await GenerateJwtToken(user);
                var newRefreshToken = GenerateRefreshToken();

                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

                await _userManager.UpdateAsync(user);

                // Ustaw nowy refresh token w cookie
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Strict,
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
                    user.RefreshToken = null;
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
            var regularCount = 0;
            var unconfirmedCount = 0;

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                if (roles.Contains("Admin"))
                    adminCount++;
                else if (roles.Contains("Opiekun"))
                    opiekunCount++;
                else if (roles.Contains("Niezatwierdzony"))
                    unconfirmedCount++;
                else // Other confirmed roles (User, etc.)
                    regularCount++;
            }

            return Ok(new
            {
                TotalUsers = users.Count,
                AdminUsers = adminCount,
                OpiekunUsers = opiekunCount,
                RegularUsers = regularCount,
                UnconfirmedUsers = unconfirmedCount
            });
        }

    }

}
