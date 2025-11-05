using Microsoft.AspNetCore.SignalR;
using Backend.Hubs;

namespace Backend.Services
{
    public class RealtimeAvailabilityService : IRealtimeAvailabilityService
    {
        private readonly IHubContext<PowiadomieniaHub> _hubContext;
        private readonly ILogger<RealtimeAvailabilityService> _logger;

        public RealtimeAvailabilityService(
            IHubContext<PowiadomieniaHub> hubContext,
            ILogger<RealtimeAvailabilityService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task NotifyAvailabilityChangedAsync(int? salaId, int? stanowiskoId, DateTime changedDate, string newStatus)
        {
            try
            {
                // Określ czy zmiana statusu wpływa na dostępność
                // oczekujące i zaakceptowano = blokują dostępność
                // odrzucono, anulowane, po terminie = uwalniają dostępność
                var affectsAvailability = newStatus is "oczekujące" or "zaakceptowano" or "odrzucono" or "anulowane" or "po terminie";
                
                if (!affectsAvailability)
                {
                    _logger.LogDebug($"Status '{newStatus}' nie wpływa na dostępność kalendarza - pomijam powiadomienie");
                    return;
                }

                string? groupName = null;
                if (salaId.HasValue)
                {
                    groupName = $"Calendar_Sala_{salaId}";
                }
                else if (stanowiskoId.HasValue)
                {
                    groupName = $"Calendar_Stanowisko_{stanowiskoId}";
                }

                if (string.IsNullOrEmpty(groupName))
                {
                    _logger.LogWarning("Brak salaId i stanowiskoId - nie można wysłać powiadomienia o zmianie dostępności");
                    return;
                }

                // Wyślij minimalne dane - frontend sam sprawdzi szczegóły
                var payload = new
                {
                    SalaId = salaId,
                    StanowiskoId = stanowiskoId,
                    ChangedDate = changedDate.ToString("yyyy-MM-dd"),
                    NewStatus = newStatus,
                    Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };

                await _hubContext.Clients.Group(groupName).SendAsync("AvailabilityChanged", payload);

                _logger.LogInformation($"Wysłano powiadomienie o zmianie dostępności do grupy {groupName} dla daty {changedDate:yyyy-MM-dd}, status: {newStatus}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas wysyłania powiadomienia o zmianie dostępności dla salaId={salaId}, stanowiskoId={stanowiskoId}, data={changedDate:yyyy-MM-dd}");
            }
        }
    }
}