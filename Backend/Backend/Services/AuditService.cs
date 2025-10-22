using Backend.Data;
using Backend.Models;
using System.Security.Claims;

namespace Backend.Services
{
    public class AuditService : IAuditService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContext;

        public AuditService(AppDbContext context, IHttpContextAccessor httpContext)
        {
            _context = context;
            _httpContext = httpContext;
        }

        public async Task LogAsync(string action, string entityType, int? entityId = null, string details = null)
        {
            var userId = _httpContext.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userEmail = _httpContext.HttpContext?.User?.Identity?.Name;

            var auditLog = new AuditLog
            {
                UserId = userId ?? "System",
                UserEmail = userEmail ?? "System",
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }
    }
}