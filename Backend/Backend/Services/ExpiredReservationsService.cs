using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ExpiredReservationsService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ExpiredReservationsService> _logger;

    public ExpiredReservationsService(
        IServiceScopeFactory scopeFactory, 
        ILogger<ExpiredReservationsService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ExpiredReservationsService started");
        
        // Poczekaj 1 minutę po starcie aplikacji
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndUpdateExpiredReservations();
                
                // Sprawdzaj co 30 minut
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Graceful shutdown - to jest normalne
                _logger.LogInformation("ExpiredReservationsService stopping gracefully");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking expired reservations");
                
                // W razie błędu - czekaj krócej i spróbuj ponownie
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
        
        _logger.LogInformation("ExpiredReservationsService stopped");
    }

    private async Task CheckAndUpdateExpiredReservations()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var now = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
        
        // Znajdź wszystkie oczekujące rezerwacje z datą końca w przeszłości
        // ✅ Używamy tej samej logiki co w kontrolerze
        var expiredReservations = await context.Rezerwacje
            .Where(r => r.Status == "oczekujące" && r.DataKoniec < now)
            .ToListAsync();

        if (expiredReservations.Count == 0)
        {
            _logger.LogInformation("No expired reservations found at {Time}", DateTime.Now);
            return;
        }

        var updatedCount = 0;
        foreach (var rezerwacja in expiredReservations)
        {
            rezerwacja.Status = "po terminie";
            updatedCount++;
        }

        await context.SaveChangesAsync();
        
        _logger.LogInformation("Updated {Count} expired reservations at {Time}", 
            updatedCount, DateTime.Now);
    }
}