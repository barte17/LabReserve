using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AuditLogController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditLogController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAuditLogs(
            string? action = null,
            string? entityType = null,
            int? entityId = null,
            string? userEmail = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            string sortBy = "Timestamp",
            string sortOrder = "desc",
            int page = 1,
            int pageSize = 20)
        {
            try
            {
                // Sprawdź czy tabela istnieje
                var tableExists = await _context.Database.CanConnectAsync();
                if (!tableExists)
                {
                    return StatusCode(500, new { message = "Brak połączenia z bazą danych" });
                }

                // Sprawdź czy tabela AuditLogs istnieje
                var query = _context.AuditLogs.AsQueryable();

                // Filtrowanie (case-insensitive)
                if (!string.IsNullOrEmpty(action))
                {
                    query = query.Where(log => log.Action.ToLower().Contains(action.ToLower()));
                }

                if (!string.IsNullOrEmpty(entityType))
                {
                    query = query.Where(log => log.EntityType.ToLower().Contains(entityType.ToLower()));
                }

                if (entityId.HasValue)
                {
                    query = query.Where(log => log.EntityId == entityId.Value);
                }

                if (!string.IsNullOrEmpty(userEmail))
                {
                    query = query.Where(log => log.UserEmail.ToLower().Contains(userEmail.ToLower()));
                }

                if (dateFrom.HasValue)
                {
                    var dateFromUtc = DateTime.SpecifyKind(dateFrom.Value, DateTimeKind.Utc);
                    query = query.Where(log => log.Timestamp >= dateFromUtc);
                }

                if (dateTo.HasValue)
                {
                    var dateToUtc = DateTime.SpecifyKind(dateTo.Value.AddDays(1), DateTimeKind.Utc);
                    query = query.Where(log => log.Timestamp <= dateToUtc);
                }

                // Sortowanie
                query = sortBy.ToLower() switch
                {
                    "action" => sortOrder == "asc" ? query.OrderBy(log => log.Action) : query.OrderByDescending(log => log.Action),
                    "entitytype" => sortOrder == "asc" ? query.OrderBy(log => log.EntityType) : query.OrderByDescending(log => log.EntityType),
                    "useremail" => sortOrder == "asc" ? query.OrderBy(log => log.UserEmail) : query.OrderByDescending(log => log.UserEmail),
                    _ => sortOrder == "asc" ? query.OrderBy(log => log.Timestamp) : query.OrderByDescending(log => log.Timestamp)
                };

                // Paginacja
                var totalCount = await query.CountAsync();
                var logs = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    logs,
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Wystąpił błąd podczas pobierania logów", 
                    error = ex.Message,
                    stackTrace = ex.StackTrace,
                    note = "Jeśli tabela AuditLogs nie istnieje, uruchom: dotnet ef database update"
                });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetAuditStats()
        {
            try
            {
                // Sprawdź czy tabela istnieje i ma dane
                var tableExists = await _context.Database.CanConnectAsync();
                if (!tableExists)
                {
                    return StatusCode(500, new { message = "Brak połączenia z bazą danych" });
                }

                var today = DateTime.SpecifyKind(DateTime.Today, DateTimeKind.Utc);
                var thisWeek = DateTime.SpecifyKind(today.AddDays(-(int)today.DayOfWeek), DateTimeKind.Utc);
                var thisMonth = DateTime.SpecifyKind(new DateTime(today.Year, today.Month, 1), DateTimeKind.Utc);

                // Bezpieczne pobieranie statystyk z obsługą pustej tabeli
                var totalLogs = 0;
                var todayLogs = 0;
                var weekLogs = 0;
                var monthLogs = 0;
                var topActions = new List<object>();
                var topUsers = new List<object>();

                try
                {
                    totalLogs = await _context.AuditLogs.CountAsync();
                    todayLogs = await _context.AuditLogs.CountAsync(log => log.Timestamp >= today);
                    weekLogs = await _context.AuditLogs.CountAsync(log => log.Timestamp >= thisWeek);
                    monthLogs = await _context.AuditLogs.CountAsync(log => log.Timestamp >= thisMonth);
                    
                    if (totalLogs > 0)
                    {
                        var topActionsData = await _context.AuditLogs
                            .GroupBy(log => log.Action)
                            .Select(g => new { Action = g.Key, Count = g.Count() })
                            .OrderByDescending(x => x.Count)
                            .Take(5)
                            .ToListAsync();
                        topActions = topActionsData.Cast<object>().ToList();

                        var topUsersData = await _context.AuditLogs
                            .Where(log => log.UserEmail != "System")
                            .GroupBy(log => log.UserEmail)
                            .Select(g => new { UserEmail = g.Key, Count = g.Count() })
                            .OrderByDescending(x => x.Count)
                            .Take(5)
                            .ToListAsync();
                        topUsers = topUsersData.Cast<object>().ToList();
                    }
                }
                catch (Exception queryEx)
                {
                    // Jeśli tabela nie istnieje lub jest problem z query
                    return Ok(new
                    {
                        totalLogs = 0,
                        todayLogs = 0,
                        weekLogs = 0,
                        monthLogs = 0,
                        topActions = new List<object>(),
                        topUsers = new List<object>(),
                        note = "Tabela AuditLogs może nie istnieć lub być pusta. Uruchom migrację: dotnet ef database update"
                    });
                }

                var stats = new
                {
                    totalLogs = totalLogs,
                    todayLogs = todayLogs,
                    weekLogs = weekLogs,
                    monthLogs = monthLogs,
                    topActions = topActions,
                    topUsers = topUsers
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Wystąpił błąd podczas pobierania statystyk", 
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}