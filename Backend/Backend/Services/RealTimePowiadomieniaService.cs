using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services
{
    public class RealTimePowiadomieniaService : IRealTimePowiadomieniaService
    {
        private readonly IHubContext<PowiadomieniaHub> _hubContext;
        private readonly ILogger<RealTimePowiadomieniaService> _logger;

        public RealTimePowiadomieniaService(
            IHubContext<PowiadomieniaHub> hubContext,
            ILogger<RealTimePowiadomieniaService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task WyslijRealTimePowiadomienieAsync(string uzytkownikId, object powiadomienie)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(uzytkownikId))
                {
                    _logger.LogWarning("Próba wysłania real-time powiadomienia bez ID użytkownika");
                    return;
                }

                await _hubContext.Clients.Group($"User_{uzytkownikId}")
                    .SendAsync("NowePowiadomienie", powiadomienie);

                _logger.LogDebug($"Wysłano real-time powiadomienie do użytkownika {uzytkownikId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas wysyłania real-time powiadomienia do użytkownika {uzytkownikId}");
            }
        }


        public async Task AktualizujLicznikAsync(string uzytkownikId, int nowaLiczba)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(uzytkownikId))
                {
                    _logger.LogWarning("Próba aktualizacji licznika bez ID użytkownika");
                    return;
                }

                await _hubContext.Clients.Group($"User_{uzytkownikId}")
                    .SendAsync("AktualizujLicznik", nowaLiczba);

                _logger.LogDebug($"Zaktualizowano licznik powiadomień dla użytkownika {uzytkownikId}: {nowaLiczba}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas aktualizacji licznika dla użytkownika {uzytkownikId}");
            }
        }
    }
}