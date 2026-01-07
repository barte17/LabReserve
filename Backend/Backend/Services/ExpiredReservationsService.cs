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
        
        // Poczekaj do najbliższego planowanego uruchomienia (:01 lub :31)
        await WaitUntilNextScheduledRun(stoppingToken);
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndUpdateExpiredReservations();
                await CheckAndSendReminderNotifications();
                
                // Czekaj 30 minut do następnego planowanego uruchomienia
                // Zawsze będzie to :01 lub :31, niezależnie od czasu startu
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
                
                // W razie błędu - synchronizuj ponownie do najbliższego zaplanowanego czasu
                await WaitUntilNextScheduledRun(stoppingToken);
            }
        }
        
        _logger.LogInformation("ExpiredReservationsService stopped");
    }
    
    private async Task WaitUntilNextScheduledRun(CancellationToken stoppingToken)
    {
        var now = DateTime.Now;
        var scheduledMinutes = new[] { 1, 31 }; // Sprawdzanie o :01 i :31 każdej godziny
        
        // Znajdź najbliższy zaplanowany czas
        var nextRun = GetNextScheduledTime(now, scheduledMinutes);
        
        var delay = nextRun - now;
        if (delay.TotalMilliseconds > 0)
        {
            _logger.LogInformation("Next scheduled check at {NextRun:HH:mm:ss} (waiting {DelayMinutes:F1} minutes)", 
                nextRun, delay.TotalMinutes);
            await Task.Delay(delay, stoppingToken);
        }
    }
    
    private static DateTime GetNextScheduledTime(DateTime now, int[] scheduledMinutes)
    {
        var currentHour = new DateTime(now.Year, now.Month, now.Day, now.Hour, 0, 0);
        
        // Sprawdź czy któraś zaplanowana minuta w tej godzinie jest w przyszłości
        foreach (var minute in scheduledMinutes.OrderBy(m => m))
        {
            var candidateTime = currentHour.AddMinutes(minute);
            if (candidateTime > now)
            {
                return candidateTime;
            }
        }
        
        // Jeśli nie, weź pierwszy czas z następnej godziny
        return currentHour.AddHours(1).AddMinutes(scheduledMinutes.Min());
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

    private async Task CheckAndSendReminderNotifications()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var powiadomieniaService = scope.ServiceProvider.GetRequiredService<IPowiadomieniaService>();
        
        var now = DateTime.SpecifyKind(
            TimeZoneInfo.ConvertTime(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time")), 
            DateTimeKind.Unspecified);
        
        var oneHourFromNow = now.AddHours(1);
        
        // Znajdź rezerwacje które zaczynają się za godzinę i są zaakceptowane
        // Okno 20-60 minut przed startem - pozwala na backup o :31 jeśli :01 nie zadziałało
        var upcomingReservations = await context.Rezerwacje
            .Include(r => r.Sala)
            .Include(r => r.Stanowisko)
            .ThenInclude(s => s.Sala)
            .Where(r => r.Status == "zaakceptowano" && 
                       r.DataStart <= oneHourFromNow && 
                       r.DataStart > now.AddMinutes(20)) // Okno 20-60 min przed (backup dla :31)
            .ToListAsync();

        var sentCount = 0;
        foreach (var rezerwacja in upcomingReservations)
        {
            // Sprawdź czy już nie wysłano przypomnienia dla tej rezerwacji
            var existingReminder = await context.Powiadomienia
                .AnyAsync(p => p.UzytkownikId == rezerwacja.UzytkownikId && 
                              p.RezerwacjaId == rezerwacja.Id &&
                              p.Tresc.Contains("Za godzine rozpoczyna sie"));

            if (!existingReminder)
            {
                var lokalizacja = GetLokalizacjaString(rezerwacja);
                var dataStart = rezerwacja.DataStart.ToString("dd.MM.yyyy HH:mm");
                
                var tytul = "Przypomnienie o rezerwacji";
                var tresc = $"Za godzinę rozpoczyna się Twoja rezerwacja na {lokalizacja}.{Environment.NewLine}{Environment.NewLine}" +
                           $"Termin: {dataStart}{Environment.NewLine}" +
                           $"Nie zapomnij się stawić!";

                await powiadomieniaService.WyslijPowiadomienieAsync(
                    rezerwacja.UzytkownikId,
                    tytul,
                    tresc,
                    "reminder",
                    "high",
                    rezerwacja.Id,
                    "/panel?view=user&section=rezerwacje"
                );
                
                sentCount++;
            }
        }
        
        if (sentCount > 0)
        {
            _logger.LogInformation("Sent {Count} reminder notifications at {Time}", sentCount, now);
        }
    }

    private static string GetLokalizacjaString(Backend.Models.Rezerwacja rezerwacja)
    {
        if (rezerwacja.SalaId.HasValue && rezerwacja.Sala != null)
        {
            return $"sala {rezerwacja.Sala.Numer} ({rezerwacja.Sala.Budynek})";
        }
        else if (rezerwacja.StanowiskoId.HasValue && rezerwacja.Stanowisko?.Sala != null)
        {
            return $"stanowisko {rezerwacja.Stanowisko.Nazwa} (sala {rezerwacja.Stanowisko.Sala.Numer}, {rezerwacja.Stanowisko.Sala.Budynek})";
        }
        return "nieznana lokalizacja";
    }
}