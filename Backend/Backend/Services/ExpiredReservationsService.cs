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
                await CheckAndSendReminderNotifications();
                await CheckAndCancelUnconfirmedReservations();
                
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
        // Sprawdź czy już nie wysłano przypomnienia (można dodać flagę w bazie lub sprawdzać przez istniejące powiadomienia)
        var upcomingReservations = await context.Rezerwacje
            .Include(r => r.Sala)
            .Include(r => r.Stanowisko)
            .ThenInclude(s => s.Sala)
            .Where(r => r.Status == "zaakceptowano" && 
                       r.DataStart <= oneHourFromNow && 
                       r.DataStart > now.AddMinutes(50)) // Okno 10 minut (50-60 min przed)
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
                var tresc = $"Za godzine rozpoczyna sie Twoja rezerwacja na {lokalizacja}. " +
                           $"Termin: {dataStart}. " +
                           $"Nie zapomnij sie stawic!";

                await powiadomieniaService.WyslijPowiadomienieAsync(
                    rezerwacja.UzytkownikId,
                    tytul,
                    tresc,
                    "przypomnienie",
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

    private async Task CheckAndCancelUnconfirmedReservations()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var powiadomieniaService = scope.ServiceProvider.GetRequiredService<IPowiadomieniaService>();
        
        var now = DateTime.SpecifyKind(
            TimeZoneInfo.ConvertTime(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time")), 
            DateTimeKind.Unspecified);
        
        // Znajdź rezerwacje które:
        // 1. Są w statusie "oczekujące" 
        // 2. Zostały utworzone więcej niż 24h temu
        // 3. Start rezerwacji jest w przyszłości (żeby nie anulować przeszłych)
        var cutoffTime = now.AddHours(-24);
        
        var unconfirmedReservations = await context.Rezerwacje
            .Include(r => r.Sala)
            .Include(r => r.Stanowisko)
            .ThenInclude(s => s.Sala)
            .Where(r => r.Status == "oczekujące" && 
                       r.DataUtworzenia < cutoffTime &&
                       r.DataStart > now) // Tylko przyszłe rezerwacje
            .ToListAsync();

        var cancelledCount = 0;
        foreach (var rezerwacja in unconfirmedReservations)
        {
            // Anuluj rezerwację
            rezerwacja.Status = "anulowane";
            
            // Wyślij powiadomienie do użytkownika
            var lokalizacja = GetLokalizacjaString(rezerwacja);
            var dataStart = rezerwacja.DataStart.ToString("dd.MM.yyyy HH:mm");
            
            var tytul = "Rezerwacja anulowana automatycznie";
            var tresc = $"Twoja rezerwacja na {lokalizacja} zostala automatycznie anulowana z powodu braku potwierdzenia przez opiekuna w ciagu 24 godzin. " +
                       $"Termin: {dataStart}. " +
                       $"Mozesz zlozyc nowa rezerwacje.";

            await powiadomieniaService.WyslijPowiadomienieAsync(
                rezerwacja.UzytkownikId,
                tytul,
                tresc,
                "rezerwacja",
                "high",
                rezerwacja.Id,
                "/panel?view=user&section=rezerwacje"
            );
            
            cancelledCount++;
        }
        
        if (cancelledCount > 0)
        {
            await context.SaveChangesAsync();
            _logger.LogInformation("Cancelled {Count} unconfirmed reservations at {Time}", cancelledCount, now);
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