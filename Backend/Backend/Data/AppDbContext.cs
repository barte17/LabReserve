using Backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Sala> Sale { get; set; }
        public DbSet<Stanowisko> Stanowiska { get; set; }
        public DbSet<Zdjecie> Zdjecia { get; set; }
        public DbSet<Rezerwacja> Rezerwacje { get; set; }
        public DbSet<Powiadomienie> Powiadomienia { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        public DbSet<ApplicationUser> Uzytkownicy { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Konfiguracja DateTime bez strefy czasowej dla PostgreSQL
            modelBuilder.Entity<Rezerwacja>(entity =>
            {
                entity.Property(e => e.DataStart)
                    .HasColumnType("timestamp"); // bez time zone

                entity.Property(e => e.DataKoniec)
                    .HasColumnType("timestamp"); // bez time zone

                entity.Property(e => e.DataUtworzenia)
                    .HasColumnType("timestamp"); // bez time zone
            });

            // Konfiguracja Powiadomienie
            modelBuilder.Entity<Powiadomienie>(entity =>
            {
                entity.Property(e => e.DataUtworzenia)
                    .HasColumnType("timestamp"); // bez time zone

                entity.Property(e => e.DataWygasniecia)
                    .HasColumnType("timestamp"); // bez time zone

                // Indeks dla wydajności zapytań
                entity.HasIndex(e => new { e.UzytkownikId, e.CzyPrzeczytane })
                    .HasDatabaseName("IX_Powiadomienia_UzytkownikId_CzyPrzeczytane");

                entity.HasIndex(e => e.DataUtworzenia)
                    .HasDatabaseName("IX_Powiadomienia_DataUtworzenia");

                // Konfiguracja cascade delete dla RezerwacjaId
                entity.HasOne(p => p.Rezerwacja)
                    .WithMany()
                    .HasForeignKey(p => p.RezerwacjaId)
                    .OnDelete(DeleteBehavior.Cascade); // Automatyczne usuwanie powiadomień przy usuwaniu rezerwacji
            });
        }

        // Walidacja rezerwacji (tylko jedno z pól SalaId lub StanowiskoId może być ustawione)
        public override int SaveChanges()
        {
            foreach (var entry in ChangeTracker.Entries<Rezerwacja>())
            {
                var r = entry.Entity;
                bool salaSet = r.SalaId.HasValue;
                bool stanowiskoSet = r.StanowiskoId.HasValue;

                if (salaSet == stanowiskoSet) // oba null albo oba ustawione
                    throw new InvalidOperationException("Rezerwacja musi mieć ustawione tylko jedno: SalaId lub StanowiskoId.");
            }

            return base.SaveChanges();
        }


    }
}
