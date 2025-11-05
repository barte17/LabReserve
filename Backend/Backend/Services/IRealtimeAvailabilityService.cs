namespace Backend.Services
{
    public interface IRealtimeAvailabilityService
    {
        /// <summary>
        /// Powiadamia użytkowników oglądających kalendarz o zmianie dostępności
        /// </summary>
        /// <param name="salaId">ID sali (jeśli dotyczy rezerwacji sali)</param>
        /// <param name="stanowiskoId">ID stanowiska (jeśli dotyczy rezerwacji stanowiska)</param>
        /// <param name="changedDate">Data, której dotyczy zmiana</param>
        /// <param name="newStatus">Nowy status rezerwacji</param>
        Task NotifyAvailabilityChangedAsync(int? salaId, int? stanowiskoId, DateTime changedDate, string newStatus);
    }
}