namespace Backend.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string toEmail, string toDisplayName, string subject, string htmlContent, string? plainTextContent = null);
        Task<bool> SendReservationNotificationEmailAsync(string toEmail, string toDisplayName, string userName, string userEmail, string locationName, DateTime dataOd, DateTime dataDo, string? opis);
        Task<bool> SendStatusChangeEmailAsync(string toEmail, string toDisplayName, string locationName, DateTime dataStart, string oldStatus, string newStatus, string? opis);
    }
}