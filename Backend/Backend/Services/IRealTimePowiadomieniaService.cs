namespace Backend.Services
{
    public interface IRealTimePowiadomieniaService
    {
        Task WyslijRealTimePowiadomienieAsync(string uzytkownikId, object powiadomienie);
        Task AktualizujLicznikAsync(string uzytkownikId, int nowaLiczba);
    }
}