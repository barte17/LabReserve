using Azure;
using Azure.Communication.Email;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public class AzureEmailServiceOptions
    {
        public const string SectionName = "AzureCommunicationServices";
        public string ConnectionString { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderDisplayName { get; set; } = "LabReserve System";
    }

    public class AzureEmailService : IEmailService
    {
        private readonly EmailClient _emailClient;
        private readonly AzureEmailServiceOptions _options;
        private readonly ILogger<AzureEmailService> _logger;

        public AzureEmailService(IOptions<AzureEmailServiceOptions> options, ILogger<AzureEmailService> logger)
        {
            _options = options.Value;
            _logger = logger;
            _emailClient = new EmailClient(_options.ConnectionString);
        }

        public async Task<bool> SendEmailAsync(string toEmail, string toDisplayName, string subject, string htmlContent, string? plainTextContent = null)
        {
            try
            {
                _logger.LogInformation($"Rozpoczynam wysyłanie emaila do: {toEmail}, temat: {subject}");

                var emailMessage = new EmailMessage(
                    senderAddress: _options.SenderEmail,
                    content: new EmailContent(subject)
                    {
                        Html = htmlContent,
                        PlainText = plainTextContent ?? StripHtmlTags(htmlContent)
                    },
                    recipients: new EmailRecipients(new List<EmailAddress> { new EmailAddress(toEmail, toDisplayName) })
                );

                EmailSendOperation emailSendOperation = await _emailClient.SendAsync(
                    WaitUntil.Completed,
                    emailMessage);

                _logger.LogInformation($"Email wysłany pomyślnie do: {toEmail}, MessageId: {emailSendOperation.Id}");
                return true;
            }
            catch (RequestFailedException ex)
            {
                _logger.LogError($"Błąd Azure podczas wysyłania emaila do {toEmail}: {ex.Message}, ErrorCode: {ex.ErrorCode}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Nieoczekiwany błąd podczas wysyłania emaila do {toEmail}: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendReservationNotificationEmailAsync(
            string toEmail, 
            string toDisplayName, 
            string userName, 
            string userEmail, 
            string locationName, 
            DateTime dataOd, 
            DateTime dataDo, 
            string? opis)
        {
            var subject = "Nowa rezerwacja w Twojej sali - LabReserve";
            var htmlContent = GenerateReservationEmailTemplate(userName, userEmail, locationName, dataOd, dataDo, opis);
            
            return await SendEmailAsync(toEmail, toDisplayName, subject, htmlContent);
        }

        private string GenerateReservationEmailTemplate(string userName, string userEmail, string locationName, DateTime dataOd, DateTime dataDo, string? opis)
        {
            var dataOdStr = dataOd.ToString("dd.MM.yyyy HH:mm");
            var dataDoStr = dataDo.ToString("dd.MM.yyyy HH:mm");
            var opisSection = !string.IsNullOrWhiteSpace(opis) ? $"<p><strong>Opis:</strong> {System.Net.WebUtility.HtmlEncode(opis)}</p>" : "";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f8f9fa; }}
        .details {{ background-color: white; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
        .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>LabReserve - Nowa Rezerwacja</h1>
        </div>
        
        <div class='content'>
            <h2>Witaj!</h2>
            <p>Informujemy, że została utworzona nowa rezerwacja w sali, której jesteś opiekunem:</p>
            
            <div class='details'>
                <h3>Szczegóły rezerwacji:</h3>
                <p><strong>Użytkownik:</strong> {System.Net.WebUtility.HtmlEncode(userName)} ({System.Net.WebUtility.HtmlEncode(userEmail)})</p>
                <p><strong>Lokalizacja:</strong> {System.Net.WebUtility.HtmlEncode(locationName)}</p>
                <p><strong>Data rozpoczęcia:</strong> {dataOdStr}</p>
                <p><strong>Data zakończenia:</strong> {dataDoStr}</p>
                {opisSection}
            </div>
            
            <p>Aby zarządzać rezerwacjami, przejdź do panelu opiekuna:</p>
            <a href='http://localhost:3000/panel?view=opiekun&section=rezerwacje' class='button'>Przejdź do Panelu</a>
            
            <div class='footer'>
                <p>To jest automatyczna wiadomość z systemu LabReserve.<br>
                Jeśli nie chcesz otrzymywać takich powiadomień, zmień ustawienia w swoim profilu.</p>
            </div>
        </div>
    </div>
</body>
</html>";
        }

        private static string StripHtmlTags(string html)
        {
            return System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", string.Empty);
        }
    }
}