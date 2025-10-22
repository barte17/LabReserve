namespace Backend.Services
{
    public interface IAuditService
    {
        Task LogAsync(string action, string entityType, int? entityId = null, string details = null);
    }
}