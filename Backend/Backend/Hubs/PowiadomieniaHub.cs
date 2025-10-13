using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Backend.Services;

namespace Backend.Hubs
{
    [Authorize]
    public class PowiadomieniaHub : Hub
    {
        private readonly IPowiadomieniaService _powiadomieniaService;
        private readonly ILogger<PowiadomieniaHub> _logger;

        public PowiadomieniaHub(IPowiadomieniaService powiadomieniaService, ILogger<PowiadomieniaHub> logger)
        {
            _powiadomieniaService = powiadomieniaService;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
                _logger.LogInformation($"Użytkownik {userId} połączył się z Hub powiadomień");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
                _logger.LogInformation($"Użytkownik {userId} rozłączył się z Hub powiadomień");
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinUserGroup()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
                _logger.LogDebug($"Użytkownik {userId} dołączył do grupy powiadomień");
            }
        }

        public async Task LeaveUserGroup()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
                _logger.LogDebug($"Użytkownik {userId} opuścił grupę powiadomień");
            }
        }

        public async Task<int> GetUnreadCount()
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId)) return 0;

            try
            {
                return await _powiadomieniaService.PobierzLiczbaNieprzeczytanychAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Błąd podczas pobierania liczby nieprzeczytanych dla użytkownika {userId}");
                return 0;
            }
        }
    }
}